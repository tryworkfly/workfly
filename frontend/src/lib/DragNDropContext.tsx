import { createContext, useContext, useState, Dispatch, SetStateAction} from 'react';

const DragNDropContext = createContext<
  [string | null, Dispatch<SetStateAction<string | null>>]
>([null, (_) => {}]);

type providerProps = {
  children: React.ReactNode;
};

export const DragNDropProvider = ({ children }: providerProps) => {
  const [type, setType] = useState<string | null>(null);

  return (
    <DragNDropContext.Provider value={[type, setType]}>
      {children}
    </DragNDropContext.Provider>
  );
}

export default DragNDropContext;

export const useDragAndDrop = () => {
  return useContext(DragNDropContext);
}