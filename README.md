# Angular Frontend for DevProGen

This is the frontend application for the DevProGen project built using Angular. It provides a user-friendly interface for managing projects, user profiles, and system metrics.

## Overview

The Angular frontend is designed to interact seamlessly with the backend services. It allows users to perform various actions, including:

- **User Management**: Registering, signing in, and managing user profiles.
- **Project Management**: Generating, updating, and deleting projects.
- **Dashboard**: Providing an overview of user activity and project status.
- **System Metrics**: Displaying system performance metrics.

## Project Structure

The project contains the following main components:

- **Services**: Contains services for handling API interactions and business logic.
- **User Module**: Manages user-related functionalities such as:
  - Dashboard
  - Project generator
  - Logs and activity history
  - Profile management
  - Project listings
  - System metrics
- **Visitor Module**: Handles components accessible to visitors, including:
  - Home page
  - Sign-in and sign-up pages
  - OAuth2 redirect handling

## Installation

To install and run this project, follow these steps:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

## Usage

To start the application, run the following command:

```bash
ng serve
```

You can access the application at 'http://localhost:4200'.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
