import React from 'react';
import axios from 'axios';
import { Meal } from '../types/Meal';
import { PantryItem } from '../types/PantryItem';

// Tipos de refeição
const MEAL_TYPES = [
  { frontLabel: 'Peq. Almoço', backendValue: 'BREAKFAST' },
  { frontLabel: 'Almoço',      backendValue: 'LUNCH' },
  { frontLabel: 'Jantar',      backendValue: 'DINNER' },
  { frontLabel: 'Snack',       backendValue: 'SNACK' },
];

// Nomes dos meses
const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Dia da semana em português
const WEEK_DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface MainScreenProps {
  meals: Meal[];
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
  draggingIngredient: PantryItem | null;
  setDraggingIngredient: React.Dispatch<React.SetStateAction<PantryItem | null>>;
  draggingMeal: Meal | null;
  setDraggingMeal: React.Dispatch<React.SetStateAction<Meal | null>>;
  refreshPantry: () => void;
}

const MainScreen: React.FC<MainScreenProps> = ({
  meals,
  setMeals,
  draggingIngredient,
  setDraggingIngredient,
  draggingMeal,
  setDraggingMeal,
  refreshPantry
}) => {
  const year = 2025;
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Agrupamento: { [month]: { [day]: { [mealType]: Meal[] } } }
  const mealMap: Record<number, Record<number, Record<string, Meal[]>>> = {};
  meals.forEach((meal) => {
    const dateObj = new Date(meal.date);
    const m = dateObj.getMonth() + 1;
    const d = dateObj.getDate();

    mealMap[m] = mealMap[m] || {};
    mealMap[m][d] = mealMap[m][d] || {};
    mealMap[m][d][meal.mealType] = mealMap[m][d][meal.mealType] || [];
    mealMap[m][d][meal.mealType].push(meal);
  });

  // Gera dias de um mês
  function getDaysInMonth(y: number, m: number) {
    const date = new Date(y, m, 0);
    return Array.from({ length: date.getDate() }, (_, i) => i + 1);
  }

  // POST: Adicionar meal
  const handleMealAdd = (month: number, day: number, mealType: string) => {
    if (!draggingIngredient) return;
    const newDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const wd = new Date(newDate).getDay();
    const dayOfWeek = WEEK_DAYS_PT[wd] || 'Seg';

    axios.post(`http://localhost:9998/api/v1/meals/add/${draggingIngredient.id}?newDate=${newDate}&mealType=${mealType}`)
      .then((res) => {
        const newMeal: Meal = {
          id: res.data.id || Math.random(),
          date: newDate,
          dayOfWeek,
          mealType,
          itemType: draggingIngredient.itemType,
          itemName: draggingIngredient.itemName,
          itemColour: draggingIngredient.itemColour,
          itemPrice: 0,
        };
        setMeals(prev => [...prev, newMeal]);
        refreshPantry();
      })
      .catch(err => console.error('Erro ao adicionar refeição:', err))
      .finally(() => {
        setDraggingIngredient(null);
      });
  };

  // PUT: Mover meal
  const handleMealMove = (month: number, day: number, mealType: string, mealToMove: Meal) => {
    const newDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const wd = new Date(newDate).getDay();
    const dayOfWeek = WEEK_DAYS_PT[wd] || 'Seg';

    axios.put(`http://localhost:9998/api/v1/meals/update/${mealToMove.id}?newDate=${newDate}&mealType=${mealType}`)
      .then(() => {
        const updatedMeal: Meal = {
          ...mealToMove,
          date: newDate,
          dayOfWeek,
          mealType
        };
        setMeals(prev => prev.map(m => (m.id === mealToMove.id ? updatedMeal : m)));
      })
      .catch(err => console.error('Erro ao mover refeição:', err))
      .finally(() => {
        setDraggingMeal(null);
      });
  };

  return (
    <div style={{ padding: '0 10px' }}>
      <h2 style={{ marginBottom: '20px' }}>Planeador de Refeições</h2>

      {months.map((month) => {
        const days = getDaysInMonth(year, month);
        const monthName = MONTH_NAMES[month - 1];

        // Vamos criar 1 + MEAL_TYPES.length linhas (1 p/ cabeçalho + 1 p/ cada tipo)
        // e 1 + days.length colunas (1 p/ rótulo + 1 p/ cada dia).
        // Se 1 célula crescer, a linha toda cresce (grid-auto-rows: auto).
        const totalRows = 1 + MEAL_TYPES.length; // row 1 = header, row 2.. = meal types
        const totalCols = 1 + days.length;       // col 1 = pinned label, col 2.. = dias

        return (
          <div key={month} style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '10px', borderBottom: '2px solid #ccc', paddingBottom: '5px' }}>
              {monthName} {year}
            </h3>

            <div style={{ overflowX: 'auto', position: 'relative' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${totalRows}, auto)`,
                  gridTemplateColumns: `150px repeat(${days.length}, 150px)`,
                  gridAutoRows: 'auto',
                  position: 'relative',
                }}
              >
                {/* Canto superior esquerdo (col 1, row 1) vazio ou título */}
                <div
                  style={{
                    gridRow: 1,
                    gridColumn: 1,
                    backgroundColor: '#f7f7f7',
                    borderBottom: '1px solid #ccc',
                    borderRight: '1px solid #ccc',
                    position: 'sticky',
                    left: 0,
                    zIndex: 2,
                  }}
                >
                  {/* Pode exibir algo aqui, se quiser */}
                </div>

                {/* Cabeçalhos dos dias (row 1, col 2..N) */}
                {days.map((day, index) => {
                  const dateObj = new Date(year, month - 1, day);
                  const dayOfWeek = WEEK_DAYS_PT[dateObj.getDay()];
                  return (
                    <div
                      key={day}
                      style={{
                        gridRow: 1,
                        gridColumn: 2 + index,
                        backgroundColor: '#f7f7f7',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        borderBottom: '1px solid #ccc',
                        borderRight: '1px solid #ccc',
                        position: 'relative',
                        lineHeight: '40px',
                      }}
                    >
                      {day} {dayOfWeek}
                    </div>
                  );
                })}

                {/* Rótulos das refeições (col 1, row 2..N) */}
                {MEAL_TYPES.map((mt, rowIndex) => (
                  <div
                    key={mt.backendValue}
                    style={{
                      gridRow: 2 + rowIndex,
                      gridColumn: 1,
                      backgroundColor: '#f0f0f0',
                      borderBottom: '1px solid #ccc',
                      borderRight: '1px solid #ccc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                      color: '#555',
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                      minHeight: '60px',
                    }}
                  >
                    {mt.frontLabel}
                  </div>
                ))}

                {/* Células: row 2..N, col 2..N */}
                {MEAL_TYPES.map((mt, rowIndex) => (
                  days.map((day, colIndex) => {
                    const row = 2 + rowIndex;
                    const col = 2 + colIndex;

                    const mealsForCell = mealMap[month]?.[day]?.[mt.backendValue] || [];

                    return (
                      <div
                        key={`${mt.backendValue}-${day}`}
                        style={{
                          gridRow: row,
                          gridColumn: col,
                          borderBottom: '1px dashed #ccc',
                          borderRight: '1px solid #ccc',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: '4px',
                          position: 'relative',
                          minHeight: '60px',
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (draggingMeal) {
                            handleMealMove(month, day, mt.backendValue, draggingMeal);
                          } else if (draggingIngredient) {
                            handleMealAdd(month, day, mt.backendValue);
                          }
                        }}
                      >
                        {mealsForCell.length > 0 ? (
                          mealsForCell.map((meal) => (
                            <div
                              key={meal.id}
                              draggable
                              onDragStart={() => setDraggingMeal(meal)}
                              style={{
                                backgroundColor: meal.itemColour || '#e0e0e0',
                                margin: '2px 0',
                                padding: '2px 4px',
                                fontSize: '0.7rem',
                                cursor: 'grab',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                textAlign: 'center',
                                width: '90%', // se quiser caber na célula
                              }}
                            >
                              {meal.itemName}
                            </div>
                          ))
                        ) : (
                          <div style={{ color: '#999', fontSize: '0.7rem' }}>— vazio —</div>
                        )}
                      </div>
                    );
                  })
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MainScreen;