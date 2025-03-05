import { useContext } from "react";
import userContext from "../context/currentUserContext";

export default function Nav(){
    const {user,setUser} = useContext(userContext);
    setUser('john doe');
    return(
        <>
        <div>nav bar
            {user.name}
        </div>
        </>
    )
}