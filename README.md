# WildfireMap

## Project Overview

WildfireMap is an interactive GIS web application for visualizing and managing wildfire data using **Next.js**, **ArcGIS Maps SDK for JavaScript**, and **ASP.NET Core Web API**.

The application allows users to:

* View wildfire features on an interactive map.
* Click features to view their information in a popup.
* Select one or multiple wildfire features.
* Remove selected features from the current map display without modifying the original ArcGIS data.
* Save selected features through a C# Web API.
* Store saved features in `saved_fires.json` located in the project root.

The project demonstrates the integration between a modern frontend, ArcGIS GIS services, and a C# backend API.

---

## Quick Start

### Requirements

* Node.js 18+
* .NET 8 SDK
* VS Code or any code editor
* Internet connection for ArcGIS FeatureServer

### Environment Setup

#### 1. Backend

Open a terminal:

```bash
cd Backend/WildfireApi
dotnet restore
dotnet run
```

API URL:

```text
http://localhost:5240
```

Endpoint:

```text
POST http://localhost:5240/api/fires
```

Make sure `http://localhost:3000` is allowed in CORS.

#### 2. Frontend

Open another terminal:

```bash
cd Frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Project Structure

`saved_fires.json` is located in the **project root**, outside both the `Frontend` and `Backend` folders.

```text
wildfire-project/
├── Frontend/
│   ├── app/
│   │   ├── (Compounts)/
│   │   │   ├── Context/
│   │   │   │   └── SelectionContext.tsx
│   │   │   ├── Map/
│   │   │   └── UI/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── package.json
│
├── Backend/
│   └── WildfireApi/
│       ├── Controllers/
│       │   └── FiresController.cs
│       ├── Models/
│       │   └── Fire.cs
│       ├── Program.cs
│       └── WildfireApi.csproj
│
├── saved_fires.json
└── README.md
```

The backend reads and updates the root `saved_fires.json` file when selected fires are saved.

---

## Frontend Features

* Displays wildfire data from ArcGIS FeatureServer.
* Supports map navigation and layer control.
* Clicking a fire opens a popup with available attributes.
* Supports selecting multiple fires.
* **Remove Select** removes selected features only from the current map display.
* **Save Selected** sends selected features to the backend.

ArcGIS source:

```text
https://sampleserver6.arcgisonline.com/arcgis/rest/services/Wildfire/FeatureServer
```

---

## Backend API

The frontend sends selected fires using:

```json
[
  {
    "id": 1,
    "attributes": {
      "OBJECTID": 1,
      "EVENTTYPE": 7
    },
    "geometry": {
      "x": -117.1,
      "y": 34.2
    }
  }
]
```

The API stores the received data in:

```text
saved_fires.json
```

The file is located in the **root of the project**, outside the Backend folder.

Existing saved data is preserved and new data is appended.

---

## Troubleshooting

### Map is not loading

* Check the internet connection.
* Make sure the ArcGIS FeatureServer URL is accessible.
* Check the browser console for errors.

### Save Selected returns CORS error

Make sure the backend allows:

```text
http://localhost:3000
```

Then restart the API.

### Save Selected returns 400

Check that selected features contain the required attributes, especially `OBJECTID` and `EVENTTYPE` when required by the API model.

### Save Selected returns 500

Check the backend terminal for the exception details and make sure `saved_fires.json` exists or can be created by the application.

### Frontend dependencies are missing

Run:

```bash
npm install
```

### Backend dependencies are missing

Run:

```bash
dotnet restore
```

### Port is already in use

Stop the process using the port, or run the application on another available port and update the frontend API URL accordingly.

---

## Workflow

1. Run the backend.
2. Run the frontend.
3. Open `http://localhost:3000`.
4. View wildfire layers on the map.
5. Click/select one or more fires.
6. Use **Remove Select** to hide them from the map, or **Save Selected** to send them to the API.
7. The backend saves the received features in the root `saved_fires.json` file.

---

## Technologies

* Next.js
* React
* TypeScript
* ArcGIS Maps SDK for JavaScript
* Axios
* C# ASP.NET Core Web API
* JSON

---

## Submission

* Frontend source code
* C# Web API
* `saved_fires.json`
* `README.md`

