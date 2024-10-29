import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, Renderer2, ChangeDetectorRef, AfterViewChecked, NgZone } from '@angular/core';
import * as yaml from 'js-yaml';
import { YamlContent, Entity, Field, Relationship } from './models/entity.model';
import { UserService } from '../../services/user.service';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import { parse } from 'csv-parse/browser/esm';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css']
})
export class GeneratorComponent implements OnInit, AfterViewInit, OnDestroy, AfterViewChecked {
  entities: Entity[] = [];
  editedEntities: Entity[] = [];
  projectName: string = '';
  jsPlumbInstance: any;
  currentStep = 1;
  @ViewChild('entityContent', { static: false }) entityContent!: ElementRef;
  @ViewChild('entityContainer', { static: false }) entityContainer!: ElementRef;
  zoomLevel = 1;
  isDragging = false;
  startX = 0;
  startY = 0;
  scrollLeft = 0;
  scrollTop = 0;
  columnSelections: { [entityName: string]: { [columnName: string]: string } } = {};

  javaTypes: string[] = [
    'String', 'Integer', 'Long', 'Double', 'Float', 'Boolean', 'Date', 'BigDecimal',
    'BigInteger', 'Byte', 'Short', 'Character', 'List'
  ];

  csvData: { [key: string]: any[] } = {};
  displayedColumns: { [key: string]: string[] } = {};
  selectedEntity: Entity | null = null;
  csvFiles: { entity: Entity; file: File }[] = [];
  showTables: { [key: string]: boolean } = {};

  constructor(
    private renderer: Renderer2,
    private ngZone: NgZone,
    private cdRef: ChangeDetectorRef,
    private userService: UserService,
    private adminService: AdminService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (!sessionStorage.getItem('token') || !sessionStorage.getItem('rid')) {
      this.router.navigate(['/DevProGen/SignIn']);
      return;
    }
  }

  async ngAfterViewInit() {
    console.log('ngAfterViewInit called');
    try {
      const { jsPlumb } = await import('jsplumb');
      this.jsPlumbInstance = jsPlumb.getInstance();
      this.waitForEntityContent();
    } catch (error) {
      console.error('Error initializing jsPlumb:', error);
    }
  }

  waitForEntityContent() {
    if (this.entityContent && this.entityContent.nativeElement) {
      console.log('entityContent is defined', this.entityContent);
      this.initializeJsPlumbInstance();
    } else {
      console.log('entityContent is not defined yet, retrying...');
      setTimeout(() => this.waitForEntityContent(), 1000);
    }
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  initializeJsPlumbInstance() {
    if (this.jsPlumbInstance && this.entityContent && this.entityContent.nativeElement) {
      this.jsPlumbInstance.setContainer(this.entityContent.nativeElement);
      this.initializeEventListeners();
      this.initializeJsPlumb();
    }
  }

  initializeEventListeners() {
    if (this.entityContainer && this.entityContainer.nativeElement) {
      this.renderer.listen(this.entityContainer.nativeElement, 'wheel', this.onZoom.bind(this));
      this.renderer.listen(this.entityContainer.nativeElement, 'mousedown', this.onMouseDown.bind(this));
      this.renderer.listen('window', 'mousemove', this.onMouseMove.bind(this));
      this.renderer.listen('window', 'mouseup', this.onMouseUp.bind(this));
      this.renderer.listen('window', 'mouseleave', this.onMouseLeave.bind(this));
    }
  }

  ngOnDestroy() {
    if (this.jsPlumbInstance) {
      this.jsPlumbInstance.reset();
    }
  }

  nextStep() {
    this.currentStep++;
  }

  previousStep() {
    this.currentStep--;
  }

  onFileUploadSelected() {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const yamlContent = e.target.result;
          const parsedContent = yaml.load(yamlContent) as YamlContent;

          if (parsedContent && parsedContent.entities) {
            this.entities = parsedContent.entities.map(entity => ({
                ...entity,
                fields: entity.fields || [],
                relationships: entity.relationships || [],
                accessControl: entity.accessControl || [],
                inheritanceControl: entity.inheritanceControl || []
            }));
            this.editedEntities = JSON.parse(JSON.stringify(this.entities)); // Deep copy for editing
            this.nextStep(); // Move to the next step automatically after file upload
        }else {
            console.error("The YAML file doesn't contain a valid 'entities' structure.");
          }
        } catch (err) {
          console.error('Error parsing YAML file:', err);
        }
      };
      reader.readAsText(file);
    }
  }

  createManually() {
    this.nextStep();
  }

  onImportDataSelected() {
    this.nextStep();
  }

  onIgnoreImportData() {
    this.currentStep = 6;
    this.nextStep();
  }

  onGenerateWithFrontEnd() {
    const editedYaml = yaml.dump({ entities: this.editedEntities, projectName: this.projectName });
      const blob = new Blob([editedYaml], { type: 'text/yaml' });
      const file = new File([blob], `${this.projectName}.yaml`, { type: 'text/yaml' });
    
      if (sessionStorage.getItem('rid') === 'A') {
        this.adminService.generateProject(file, this.projectName, false).subscribe(
          response => this.handleFileDownload(response, `${this.projectName}.zip`),
          error => console.error('Error generating project:', error)
        );
      } else if (sessionStorage.getItem('rid') === 'U') {
        this.userService.generateProject(file, this.projectName, false).subscribe(
          response => this.handleFileDownload(response, `${this.projectName}.zip`),
          error => console.error('Error generating project:', error)
        );
      }
  }

  onGenerateWithoutFrontEnd() {
    const editedYaml = yaml.dump({ entities: this.editedEntities, projectName: this.projectName });
      const blob = new Blob([editedYaml], { type: 'text/yaml' });
      const file = new File([blob], `${this.projectName}.yaml`, { type: 'text/yaml' });
    
      if (sessionStorage.getItem('rid') === 'A') {
        this.adminService.generateProject(file, this.projectName, true).subscribe(
          response => this.handleFileDownload(response, `${this.projectName}.zip`),
          error => console.error('Error generating project:', error)
        );
      } else if (sessionStorage.getItem('rid') === 'U') {
        this.userService.generateProject(file, this.projectName, true).subscribe(
          response => this.handleFileDownload(response, `${this.projectName}.zip`),
          error => console.error('Error generating project:', error)
        );
      }
  }

  onCsvFileSelected(event: any, entity: Entity) {
    const file = event.target.files[0];
    if (file) {
      this.csvFiles.push({ entity, file });
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const content = e.target.result;
        this.selectedEntity = entity;
        this.parseCsv(content, entity.name);
      };
      reader.readAsText(file);
    }
  }

  onColumnSelectionChange(selectedValue: string, entityName: string, columnName: string): void {
    if (!this.columnSelections[entityName]) {
      this.columnSelections[entityName] = {};
    }
    this.columnSelections[entityName][columnName] = selectedValue;
  }

  parseCsv(csvContent: string, entityName: string) {
    parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    }, (err, output) => {
      if (err) {
        console.error('Error parsing CSV file:', err);
      } else {
        this.csvData[entityName] = output;
  
        // Ensure the 'id' column is included in the displayed columns
        this.displayedColumns[entityName] = ['id', ...Object.keys(this.csvData[entityName][0]).filter(column => column !== 'id')];
  
        // Initialize column selections
        this.columnSelections[entityName] = {};
        this.displayedColumns[entityName].forEach(column => {
          this.columnSelections[entityName][column] = column; // Default to the original column name
        });
  
        this.currentStep = 6; // Move to the next step to display CSV data
        this.showTables[entityName] = true;
      }
    });
  }

  
  

  getSelectedField(entity: Entity, column: string): string | undefined {
    const field = entity.fields.find(field => field.name === column);
    return field ? field.name : undefined;
  }

  getFieldNameByColumn(column: string): string | undefined {
    if (this.selectedEntity) {
      const field = this.selectedEntity.fields.find(field => field.name === column);
      return field ? field.name : undefined;
    }
    return undefined;
  }

  setFieldNameByColumn(value: string, column: string): void {
    if (this.selectedEntity) {
      const field = this.selectedEntity.fields.find(field => field.name === column);
      if (field) {
        field.name = value;
      } else {
        const rel = this.selectedEntity.relationships.find(rel => rel.name === column);
        if (rel) {
          rel.name = value;
        }
      }
    }
  }

  initializeJsPlumb() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        if (this.jsPlumbInstance && this.entityContent) {
          this.jsPlumbInstance.reset();

          const existingConnections = new Set<string>();

          this.editedEntities.forEach((entity, index) => {
            const entityId = `entity-${index}`;
            const entityElement = document.getElementById(entityId);

            if (entityElement) {
              if (!this.isElementDraggable(entityElement)) {
                console.log(`Making entity ${entityId} draggable.`);
                try {
                  this.jsPlumbInstance.draggable(entityElement);
                } catch (err) {
                  console.error(`Error making entity ${entityId} draggable:`, err);
                }
              } else {
                console.log(`Entity ${entityId} is already draggable.`);
              }

              entity.relationships.forEach(relationship => {
                const targetEntityIndex = this.editedEntities.findIndex(e => e.name === relationship.targetEntity);
                if (targetEntityIndex !== -1) {
                  const targetEntityId = `entity-${targetEntityIndex}`;
                  const connectionKey = this.generateConnectionKey(entityId, targetEntityId);

                  if (!existingConnections.has(connectionKey)) {
                    existingConnections.add(connectionKey);
                    const sourceCardinality = this.getCardinality(relationship.type);
                    try {
                      this.jsPlumbInstance.connect({
                        source: entityId,
                        target: targetEntityId,
                        anchor: "Continuous",
                        connector: "Straight",
                        endpoint: ["Dot", { radius: 2 }],
                        paintStyle: { stroke: this.getConnectionColor(relationship.type), strokeWidth: 2 },
                        overlays: [
                          ["Label", { label: sourceCardinality.source, location: 0.25, cssClass: 'cardinality-label' }],
                          ["Label", { label: sourceCardinality.target, location: 0.75, cssClass: 'cardinality-label' }]
                        ]
                      });
                      console.log(`Connected ${entityId} to ${targetEntityId}.`);
                    } catch (err) {
                      console.error(`Error connecting ${entityId} to ${targetEntityId}:`, err);
                    }
                  }
                }
              });
            } else {
              console.warn(`Entity element with ID ${entityId} not found.`);
            }
          });
        } else {
          console.error('jsPlumbInstance or entityContent is not properly initialized');
        }
      }, 100); // Adjust delay if necessary
    });
  }

  isElementDraggable(element: HTMLElement): boolean {
    return element.classList.contains('jtk-draggable');
  }

  refreshEntities() {
    this.entities = JSON.parse(JSON.stringify(this.editedEntities)); // Apply temporary changes to main state
    this.initializeJsPlumb(); // Reinitialize jsPlumb connections
    this.cdRef.detectChanges(); // Ensure UI updates
  }

  generateConnectionKey(sourceId: string, targetId: string): string {
    return [sourceId, targetId].sort().join('-');
  }

  getCardinality(type: string): { source: string; target: string } {
    switch (type) {
      case 'OneToMany':
        return { source: '1', target: '*' };
      case 'ManyToOne':
        return { source: '*', target: '1' };
      case 'OneToOne':
        return { source: '1', target: '1' };
      case 'ManyToMany':
        return { source: '*', target: '*' };
      default:
        return { source: '', target: '' };
    }
  }

  getConnectionColor(type: string): string {
    switch (type) {
      case 'OneToMany':
        return '#5c96bc'; // Example color for OneToMany
      case 'ManyToOne':
        return '#f56b2a'; // Example color for ManyToOne
      case 'OneToOne':
        return '#32a852'; // Example color for OneToOne
      case 'ManyToMany':
        return '#e02a69'; // Example color for ManyToMany
      default:
        return '#000000'; // Default color
    }
  }

  onEntityChange(index: number, field: keyof Entity, value: any) {
    this.editedEntities[index][field] = value;
  }

  onFieldChange(entityIndex: number, fieldIndex: number, key: keyof Field, value: Field[keyof Field]) {
    const field = this.editedEntities[entityIndex].fields[fieldIndex];
    
    if (key in field) {
        (field[key] as typeof value) = value;
    } else {
        console.error(`Invalid key: ${key} for Field`);
    }
}

onRelationshipChange(entityIndex: number, relIndex: number, key: keyof Relationship, value: Relationship[keyof Relationship]) {
    const relationship = this.editedEntities[entityIndex].relationships[relIndex];
    
    if (key in relationship) {
        (relationship[key] as typeof value) = value;
    } else {
        console.error(`Invalid key: ${key} for Relationship`);
    }
}




  onAccessControlChange(entityIndex: number, role: string) {
    const entity = this.editedEntities[entityIndex];
    entity.accessControl = [{ role, allowed: role === 'ADMIN' }];
  }

  onInheritanceControlChange(entityIndex: number, inheritance: boolean) {
    const entity = this.editedEntities[entityIndex];
    if (entity.inheritanceControl && entity.inheritanceControl.length > 0) {
      entity.inheritanceControl[0].inheritance = inheritance;
    } else {
      entity.inheritanceControl = [{ inheritance }];
    }
  }

  onZoom(event: WheelEvent) {
    event.preventDefault();
    if (event.deltaY < 0) {
      this.zoomLevel += 0.1;
    } else {
      this.zoomLevel = Math.max(0.1, this.zoomLevel - 0.1);
    }
    this.applyZoom();
  }

  zoomIn() {
    this.zoomLevel += 0.1;
    this.applyZoom();
  }

  zoomOut() {
    this.zoomLevel = Math.max(0.1, this.zoomLevel - 0.1);
    this.applyZoom();
  }

  applyZoom() {
    if (this.entityContent && this.entityContent.nativeElement) {
      this.entityContent.nativeElement.style.transform = `scale(${this.zoomLevel})`;
    }
  }

  onMouseDown(event: MouseEvent) {
    // Prevent dragging if the target is an input, textarea, or select element
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      return;
    }

    // Start dragging
    this.isDragging = true;
    this.startX = event.pageX;
    this.startY = event.pageY;
    this.scrollLeft = this.entityContainer.nativeElement.scrollLeft;
    this.scrollTop = this.entityContainer.nativeElement.scrollTop;
    this.renderer.setStyle(this.entityContainer.nativeElement, 'cursor', 'grabbing');
    this.preventTextSelection();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    event.preventDefault();
    const x = event.pageX - this.startX;
    const y = event.pageY - this.startY;
    this.entityContainer.nativeElement.scrollLeft = this.scrollLeft - x;
    this.entityContainer.nativeElement.scrollTop = this.scrollTop - y;
  }

  onMouseUp() {
    this.isDragging = false;
    this.renderer.setStyle(this.entityContainer.nativeElement, 'cursor', 'grab');
    this.enableTextSelection();
  }

  onMouseLeave() {
    if (this.isDragging) {
      this.isDragging = false;
      this.renderer.setStyle(this.entityContainer.nativeElement, 'cursor', 'grab');
      this.enableTextSelection();
    }
  }

  preventTextSelection() {
    document.body.style.userSelect = 'none';
  }

  enableTextSelection() {
    document.body.style.userSelect = 'auto';
  }

  addNewEntity() {
    const newEntity: Entity = {
      name: 'NewEntity',
      fields: [],
      relationships: [],
      accessControl: [{ role: 'USER', allowed: false }],
      inheritanceControl: [{ inheritance: false }]
    };
    this.editedEntities.push(newEntity);
  }

  addNewField(entityIndex: number) {
    const newField: Field = { name: '', type: this.javaTypes[0], required: false };// Default to first Java type
    this.editedEntities[entityIndex].fields.push(newField);
  }

  addNewRelationship(entityIndex: number) {
    const newRelationship: Relationship = { name: '', type: 'OneToOne', targetEntity: '', required: false };
    this.editedEntities[entityIndex].relationships.push(newRelationship);
  }

  removeField(entityIndex: number, fieldIndex: number) {
    this.editedEntities[entityIndex].fields.splice(fieldIndex, 1);
  }

  removeRelationship(entityIndex: number, relIndex: number) {
    this.editedEntities[entityIndex].relationships.splice(relIndex, 1);
  }

  removeEntity(entityIndex: number) {
    this.editedEntities.splice(entityIndex, 1);
  }

  getEntityNames(): string[] {
    return this.editedEntities.map(entity => entity.name);
  }

  onSubmit() {
    const editedYaml = yaml.dump({ entities: this.editedEntities, projectName: this.projectName });
    const blob = new Blob([editedYaml], { type: 'text/yaml' });
    const file = new File([blob], `${this.projectName}.yaml`, { type: 'text/yaml' });
  
    if (sessionStorage.getItem('rid') === 'A') {
      this.adminService.generateProject(file, this.projectName, false).subscribe(
        response => this.handleFileDownload(response, `${this.projectName}.zip`),
        error => this.snackBar.open('Error generating project', "Close")
      );
    } else if (sessionStorage.getItem('rid') === 'U') {
      this.userService.generateProject(file, this.projectName, false).subscribe(
        response => this.handleFileDownload(response, `${this.projectName}.zip`),
        error => this.snackBar.open('Error generating project', "Close")
      );
    }
  }

  handleFileDownload(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  saveEditedCsv(entityName: string) {
    if (this.csvData[entityName]) {
      const csvContent = this.csvData[entityName].map(row => {
        return this.displayedColumns[entityName].map(column => row[column]).join(',');
      }).join('\n');
  
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const file = new File([blob], `${entityName}.csv`, { type: 'text/csv' });
  
      // Remove existing entry for the entity
      this.csvFiles = this.csvFiles.filter(f => f.entity.name !== entityName);
  
      // Add the new file
      const entity = this.entities.find(e => e.name === entityName);
      if (entity) {
        this.csvFiles.push({ entity, file });
      }
    }
  }
  
}
