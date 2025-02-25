export interface Meal {
  id: number;
  date: string;       // "YYYY-MM-DD"
  dayOfWeek: string;  // Exemplo: "MONDAY"
  mealType: string;   // Exemplo: "BREAKFAST", "LUNCH", etc.
  itemType: string;
  itemName: string;
  itemColour: string;
  itemPrice: number;
}