import React from 'react';
import {
  ProSidebar,
  Menu,
  MenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarContent
} from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
import { PantryItem } from '../types/PantryItem';
import { Meal } from '../types/Meal';

interface SidebarProps {
  ingredients: PantryItem[];
  collapsed: boolean;
  toggled: boolean;
  handleToggleSidebar: (value: boolean) => void;
  handleCollapsedChange: () => void;
  onDragStartIngredient: (ingredient: PantryItem) => void;
  // Adicionamos essas props para drop de meal
  draggingMeal?: Meal | null;
  onDropMeal?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  ingredients,
  collapsed,
  toggled,
  handleToggleSidebar,
  handleCollapsedChange,
  onDragStartIngredient,
  draggingMeal,
  onDropMeal,
}) => {
  return (
    // Envolvemos a ProSidebar num div que será drop target para deleção
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => {
        if (draggingMeal && onDropMeal) {
          onDropMeal();
        }
      }}
    >
      <ProSidebar
        collapsed={collapsed}
        toggled={toggled}
        onToggle={() => handleToggleSidebar(!toggled)}
        breakPoint="md"
      >
        <SidebarHeader>
          <Menu iconShape="circle">
            <MenuItem onClick={handleCollapsedChange}>
              Menu
            </MenuItem>
          </Menu>
        </SidebarHeader>
        <SidebarContent>
          <Menu iconShape="circle">
            <MenuItem>Dispensa</MenuItem>
            {ingredients.map(ingredient => (
              <div
                key={ingredient.id}
                draggable
                onDragStart={() => onDragStartIngredient(ingredient)}
                style={{
                  margin: '8px',
                  padding: '6px',
                  backgroundColor: ingredient.itemColour || '#eee',
                  borderRadius: '4px',
                  cursor: 'grab'
                }}
              >
                {ingredient.itemName} ({ingredient.itemTotalDosis})
              </div>
            ))}
          </Menu>
        </SidebarContent>
        <SidebarFooter style={{ textAlign: 'center' }}>
          <div style={{ padding: '10px' }}>© 2025 Meal Planner</div>
        </SidebarFooter>
      </ProSidebar>
    </div>
  );
};

export default Sidebar;