# Meal Planner Frontend

![Screenshot](./src/main/resources/images/FrontImage.png)

This repository contains the frontend portion of the Meal Planner application built with React. The frontend consumes the backend APIs to display and manage meals and pantry items through a modern, drag & drop interface.

## Technologies Used

- **React** for building the user interface.
- **Axios** for HTTP requests.
- **CSS/SCSS** for styling.
- **React Pro Sidebar** for the sidebar component.

## Features

- **Dynamic Calendar View**: Displays all months and days of the selected year with a fixed column for meal types.
- **Drag & Drop Functionality**:
  - Drag items from the pantry to add new meals.
  - Move existing meals between days by dragging.
  - Drop meals onto the sidebar (or designated area) to delete them.
- **Responsive Design**: Horizontal scrolling for days if the screen width is exceeded; vertical space remains fixed.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6+) or yarn

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/MrW1cked/Meal-Planner-Front.git
   cd Meal-Planner-Front
   ```

2. **Install dependencies:**

   Using npm:

   ```bash
   npm install
   ```

   Or using yarn:

   ```bash
   yarn install
   ```

3. **Start the development server:**

   Using npm:

   ```bash
   npm start
   ```

   Or using yarn:

   ```bash
   yarn start
   ```

   The application will start on [http://localhost:3000](http://localhost:3000).

## Configuration

The frontend is configured to communicate with the backend endpoints. By default, it uses the following URL for API calls:

```
http://localhost:9998/api/v1/meals
```

Make sure the backend is running. The backend repository is available here:

[Meal Planner Backend](https://github.com/MrW1cked/Meal-Planner-Back.git)

## Project Structure

- **src/**
  - **components/**: Contains reusable UI components (e.g., Sidebar).
  - **pages/**: Contains page-level components (e.g., MainScreen).
  - **types/**: TypeScript interfaces for data models (e.g., Meal, PantryItem).
  - **App.tsx**: Main application component that integrates the Sidebar and MainScreen.
  - **index.tsx**: Entry point for the React application.

## API Endpoints

The frontend interacts with the backend API. For detailed API documentation, please refer to the backend repository's README or Swagger/OpenAPI documentation.

Key endpoints include:

- `GET /api/v1/meals/year/{year}/all` - Retrieves all meals for a given year.
- `GET /api/v1/meals/pantry/all` - Retrieves all pantry items.
- `POST /api/v1/meals/add/{id}?newDate={date}&mealType={type}` - Adds a new meal based on a pantry item.
- `PUT /api/v1/meals/update/{id}?newDate={date}&mealType={type}` - Updates an existing meal (move to new date/type).
- `DELETE /api/v1/meals/delete/{id}` - Deletes a meal.

## Contributing

1. Fork the repository.
2. Create a new branch for your feature or bug fix:  
   `git checkout -b feature/your-feature`
3. Commit your changes and push the branch.
4. Open a pull request with a clear description of your changes.

## License

This project does not have a specified license. Please contact the maintainers for more information.

---

We hope you enjoy using the Meal Planner Frontend! If you have any questions or suggestions, feel free to open an issue or contact the maintainers.

**Backend Repository:** [Meal Planner Backend](https://github.com/MrW1cked/Meal-Planner-Back.git)

