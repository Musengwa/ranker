import { useState } from "react";
import userContext from "./currentUserContext";

const UserProvider = ({children}) =>{
    const [user, setuser] = useState({name:"", id:{}});

    return(
        <userContext.Provider value={{user, setuser}}>
            {children}
        </userContext.Provider>
    )
}

export default UserProvider;