import { createContext, useContext, useState } from 'react';
import { format } from 'date-fns';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  return (
    <AppContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
