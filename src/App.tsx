import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import MainScreen from './pages/MainScreen';
import { PantryItem } from './types/PantryItem';
import { Meal } from './types/Meal';

interface MonthCost {
  month: number;
  cost: number;
}

interface BackendData {
  ingredients: PantryItem[];
  meals: Meal[];
  monthCosts: MonthCost[];
}

function App() {
  const [data, setData] = useState<BackendData>({ ingredients: [], meals: [], monthCosts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para Sidebar e drag & drop
  const [collapsed, setCollapsed] = useState(false);
  const [toggled, setToggled] = useState(false);
  const [draggingIngredient, setDraggingIngredient] = useState<PantryItem | null>(null);
  const [draggingMeal, setDraggingMeal] = useState<Meal | null>(null);

  // Função para buscar os dados do backend
  const fetchData = () => {
    Promise.all([
      axios.get<Meal[]>('http://localhost:9998/api/v1/meals/year/2025/all'),
      axios.get<PantryItem[]>('http://localhost:9998/api/v1/meals/pantry/all'),
      axios.get<MonthCost[]>('http://localhost:9998/api/v1/meals/year/2025')
    ])
      .then(([mealsRes, pantryRes, monthCostsRes]) => {
        setData({
          ingredients: pantryRes.data,
          meals: mealsRes.data,
          monthCosts: monthCostsRes.data,
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao buscar dados:', err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCollapsedChange = () => setCollapsed(!collapsed);
  const handleToggleSidebar = (value: boolean) => setToggled(value);

  // Setter para meals, integrando com o estado global data
  const setMealsHandler: React.Dispatch<React.SetStateAction<Meal[]>> = (value) => {
    setData(prev => ({
      ...prev,
      meals: typeof value === 'function'
        ? (value as (prevState: Meal[]) => Meal[])(prev.meals)
        : value
    }));
  };

  // Função para deletar um meal (chamado ao soltar no Sidebar)
  const handleMealDelete = () => {
    if (!draggingMeal) return;
    const url = `http://localhost:9998/api/v1/meals/delete/${draggingMeal.id}`;
    axios.delete(url)
      .then(() => {
        setData(prev => ({
          ...prev,
          meals: prev.meals.filter(m => m.id !== draggingMeal.id)
        }));
        fetchData();
      })
      .catch(err => console.error('Erro ao deletar refeição:', err))
      .finally(() => {
        setDraggingMeal(null);
      });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        ingredients={data.ingredients}
        collapsed={collapsed}
        toggled={toggled}
        handleToggleSidebar={handleToggleSidebar}
        handleCollapsedChange={handleCollapsedChange}
        onDragStartIngredient={setDraggingIngredient}
        draggingMeal={draggingMeal}
        onDropMeal={handleMealDelete}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        <h1>Meal Planner</h1>
        <MainScreen
          meals={data.meals}
          setMeals={setMealsHandler}
          draggingIngredient={draggingIngredient}
          setDraggingIngredient={setDraggingIngredient}
          draggingMeal={draggingMeal}
          setDraggingMeal={setDraggingMeal}
          refreshPantry={fetchData}
          monthCosts={data.monthCosts}
        />
      </div>
    </div>
  );
}

export default App;
