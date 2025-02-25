import React from 'react';
import axios from 'axios';
import { Meal } from '../types/Meal';
import { PantryItem } from '../types/PantryItem';

// Mapeamento dos tipos de refeição: valor do backend → label exibido
const MEAL_TYPES = [
  { frontLabel: 'Peq. Almoço', backendValue: 'BREAKFAST' },
  { frontLabel: 'Almoço',      backendValue: 'LUNCH' },
  { frontLabel: 'Jantar',      backendValue: 'DINNER' },
  { frontLabel: 'Snack',       backendValue: 'SNACK' },
];

// Nomes dos meses em português
const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Dias da semana em português
const WEEK_DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface MonthCost {
  month: number;
  cost: number;
}

interface MainScreenProps {
  meals: Meal[];
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
  draggingIngredient: PantryItem | null;
  setDraggingIngredient: React.Dispatch<React.SetStateAction<PantryItem | null>>;
  draggingMeal: Meal | null;
  setDraggingMeal: React.Dispatch<React.SetStateAction<Meal | null>>;
  refreshPantry: () => void;
  monthCosts: MonthCost[];
}

const MainScreen: React.FC<MainScreenProps> = ({
  meals,
  setMeals,
  draggingIngredient,
  setDraggingIngredient,
  draggingMeal,
  setDraggingMeal,
  refreshPantry,
  monthCosts,
}) => {
  const year = 2025;
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Agrupa os meals por mês, dia e tipo (permitindo múltiplos itens)
  const mealMap: Record<number, Record<number, Record<string, Meal[]>>> = {};
  meals.forEach((meal) => {
    const dateObj = new Date(meal.date);
    const m = dateObj.getMonth() + 1;
    const d = dateObj.getDate();
    if (!mealMap[m]) mealMap[m] = {};
    if (!mealMap[m][d]) mealMap[m][d] = {};
    if (!mealMap[m][d][meal.mealType]) mealMap[m][d][meal.mealType] = [];
    mealMap[m][d][meal.mealType].push(meal);
  });

  // Função para gerar os dias do mês
  function getDaysInMonth(y: number, m: number): number[] {
    const date = new Date(y, m, 0);
    return Array.from({ length: date.getDate() }, (_, i) => i + 1);
  }

  // POST: Adicionar novo meal a partir de um item da pantry
  const handleMealAdd = (month: number, day: number, mealType: string) => {
    if (!draggingIngredient) return;
    const newDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const weekDayIndex = new Date(newDate).getDay();
    const computedDayOfWeek = WEEK_DAYS_PT[weekDayIndex] || 'Seg';
    const url = `http://localhost:9998/api/v1/meals/add/${draggingIngredient.id}?newDate=${newDate}&mealType=${mealType}`;
    
    axios.post(url)
      .then((res) => {
        console.log('POST OK:', res.data);
        const newMeal: Meal = {
          id: res.data.id || Math.random(),
          date: newDate,
          dayOfWeek: computedDayOfWeek,
          mealType: mealType,
          itemType: draggingIngredient.itemType,
          itemName: draggingIngredient.itemName,
          itemColour: draggingIngredient.itemColour,
          itemPrice: Number(draggingIngredient.itemPricePerDosis) || 0,
        };
        setMeals(prev => [...prev, newMeal]);
        refreshPantry();
      })
      .catch((err) => console.error('Erro ao adicionar refeição:', err))
      .finally(() => {
        setDraggingIngredient(null);
      });
  };

  // PUT: Mover um meal existente
  const handleMealMove = (month: number, day: number, mealType: string, mealToMove: Meal) => {
    const newDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const weekDayIndex = new Date(newDate).getDay();
    const computedDayOfWeek = WEEK_DAYS_PT[weekDayIndex] || 'Seg';
    const url = `http://localhost:9998/api/v1/meals/update/${mealToMove.id}?newDate=${newDate}&mealType=${mealType}`;
    
    axios.put(url)
      .then(() => {
        const updatedMeal: Meal = {
          ...mealToMove,
          date: newDate,
          dayOfWeek: computedDayOfWeek,
          mealType: mealType,
        };
        setMeals(prev => prev.map(m => m.id === mealToMove.id ? updatedMeal : m));
      })
      .catch((err) => console.error('Erro ao mover refeição:', err))
      .finally(() => {
        setDraggingMeal(null);
      });
  };

  // Cálculo do total de um dia (soma de itemPrice de todos os meals do dia)
  const getDayTotal = (month: number, day: number): number => {
    const dayData = mealMap[month]?.[day];
    if (!dayData) return 0;
    return Object.values(dayData).reduce((total, mealsArr) => {
      return total + mealsArr.reduce((sum, meal) => sum + Number(meal.itemPrice), 0);
    }, 0);
  };

  return (
    <div style={{ padding: '0 10px' }}>
      <h2 style={{ marginBottom: '20px' }}>Meal Planner</h2>

      {months.map((month) => {
        const days = getDaysInMonth(year, month);
        const monthName = MONTH_NAMES[month - 1];
        // Obter o total do mês a partir dos dados do backend (prop monthCosts)
        const monthCost = monthCosts.find(mc => mc.month === month)?.cost || 0;

        // Total de linhas: 1 (header) + MEAL_TYPES.length + 1 (linha de total diário)
        const totalRows = 1 + MEAL_TYPES.length + 1;
        // Colunas: 1 (pinned) + days.length
        const totalCols = 1 + days.length;

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
                {/* Célula superior esquerda (vazia) */}
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
                ></div>

                {/* Cabeçalhos dos dias (row 1, colunas 2..N) */}
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
                        lineHeight: '40px',
                        position: 'relative',
                      }}
                    >
                      {day} {dayOfWeek}
                    </div>
                  );
                })}

                {/* Linhas para cada tipo de refeição */}
                {MEAL_TYPES.map((mt, rowIndex) => (
                  <React.Fragment key={mt.backendValue}>
                    {/* Coluna fixa para rótulo do tipo (sticky) */}
                    <div
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

                    {days.map((day, colIndex) => {
                      const cellMeals = (mealMap[month]?.[day]?.[mt.backendValue]) || [];
                      return (
                        <div
                          key={`${mt.backendValue}-${day}`}
                          style={{
                            gridRow: 2 + rowIndex,
                            gridColumn: 2 + colIndex,
                            borderBottom: '1px dashed #ccc',
                            borderRight: '1px solid #ccc',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2px',
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
                          {cellMeals.length > 0 ? (
                            cellMeals.map((meal) => (
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
                                  width: '90%',
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
                    })}
                  </React.Fragment>
                ))}

                {/* Linha de total diário (última linha, row = 1 + MEAL_TYPES.length + 1) */}
                <div
                  style={{
                    gridRow: 1 + MEAL_TYPES.length + 1,
                    gridColumn: 1,
                    backgroundColor: '#f7f7f7',
                    borderTop: '1px solid #ccc',
                    borderRight: '1px solid #ccc',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    padding: '4px',
                    position: 'sticky',
                    left: 0,
                    zIndex: 2,
                  }}
                >
                  Total
                </div>
                {days.map((day, index) => {
                  const dayTotal = Object.values(mealMap[month]?.[day] || {}).reduce((sum, mealsArr) => {
                    return sum + mealsArr.reduce((s, meal) => s + Number(meal.itemPrice), 0);
                  }, 0);
                  return (
                    <div
                      key={`total-${day}`}
                      style={{
                        gridRow: 1 + MEAL_TYPES.length + 1,
                        gridColumn: 2 + index,
                        backgroundColor: '#f7f7f7',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        borderTop: '1px solid #ccc',
                        borderRight: '1px solid #ccc',
                        lineHeight: '40px',
                        fontSize: '0.8rem',
                      }}
                    >
                      ${dayTotal.toFixed(2)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Exibição do total do mês abaixo do grid */}
            <div style={{ textAlign: 'right', marginTop: '5px', fontWeight: 'bold' }}>
              Month Total: ${monthCosts.find(mc => mc.month === month)?.cost.toFixed(2) || "0.00"}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MainScreen;
