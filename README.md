# PAYDAY
**The smart way to track your work hours and income**

PAYDAY is a modern desktop and web application designed to help freelancers, shift workers, and anyone with variable work hours track their income, manage their schedule, and plan their finances.

![image](https://github.com/user-attachments/assets/74341444-72dd-4951-9133-f96e209cb0df)
![image](https://github.com/user-attachments/assets/b6e882e4-c5d6-4c0a-8a5d-d8aabe0b828b)
![image](https://github.com/user-attachments/assets/c387d5ff-7154-4348-b25b-68bf46052fae)
![image](https://github.com/user-attachments/assets/f67559ed-a014-42c1-8660-693af5b722f7)
![image](https://github.com/user-attachments/assets/be2a848e-d727-4b29-8a34-8f565d9fd7ad)
![image](https://github.com/user-attachments/assets/01c221e3-bc13-4f0d-985e-5c169be991f1)


## Features
* 📅 **Work Schedule Management**: Track shifts, appointments, and work hours
* 💰 **Income Tracking**: Calculate earnings based on hourly rates
* 📊 **Financial Analytics**: Visualize earnings trends and forecasts
* 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
* 🌙 **Dark Mode**: Easy on the eyes, day or night
* 🔐 **Secure Authentication**: Keep your financial data private
* 🖥️ **Desktop App**: Native desktop application for Windows, macOS, and Linux

## Tech Stack
PAYDAY is built with modern web technologies:
* **Frontend**: React, TypeScript, Vite
* **UI Components**: Shadcn/UI, TailwindCSS
* **Data Management**: TanStack Query (React Query)
* **Backend**: Supabase (PostgreSQL, Authentication, Storage)
* **Routing**: React Router
* **Data Visualization**: Recharts
* **Icons**: Lucide React
* **Desktop App**: Tauri (Rust-based framework for building lightweight, secure desktop applications)

## Project Status
**⚠️ PAYDAY is currently under active development**. Core features are being implemented and refined. The application is not yet ready for production use.

## Getting Started

### Prerequisites
* Node.js 18+ installed
* Git
* Rust (for Tauri desktop app development)
* A Supabase account (for backend functionality)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/payday.git
   cd payday
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables: Create a `.env` file in the project root with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Running the Web Version
Start the development server:
```bash
npm run dev
```

Visit `http://localhost:8080` to view the application.

### Running the Desktop App (Tauri)
To run the desktop application in development mode:
```bash
npm run tauri dev
```

## Building for Production

### Web Version
To build the web application for production:
```bash
npm run build
```

The optimized output will be in the `dist` folder.

### Desktop App
To build the desktop executable:
```bash
npm run tauri build
```

This will create platform-specific binaries in the `src-tauri/target/release` directory.

## Deployment

### Web App
PAYDAY can be deployed to various hosting platforms:

**Netlify/Vercel**  
Simply connect your repository to Netlify or Vercel and configure the build settings.

**Traditional Hosting**  
Upload the contents of the `dist` folder to your web server.

### Desktop App
Distributable installers for Windows, macOS, and Linux are generated when running the Tauri build command. These can be distributed through your preferred channels.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For support or feature requests, please open an issue on the GitHub repository.
