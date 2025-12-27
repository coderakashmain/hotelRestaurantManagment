import { createContext, useContext, useState } from "react"

const  MrDatacontext = createContext<any>(null);



export const useMrData = () => {
  return useContext(MrDatacontext);
}   


const MrDataContext = ({ children } : any) => {
        const [ mrData, setMrData ] = useState<null>(null);
        


    
  return (
    <MrDatacontext.Provider value={{ mrData, setMrData }}>
      {children}
    </MrDatacontext.Provider>
  )
}

export default MrDataContext
