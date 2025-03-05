import UserCards from "../components/userCard";
import { useEffect, useState } from "react";
export default function Voting(){
    const [users, setUsers] = useState([]);

    useEffect(()=>{
        fetch("http://localhost:5000/users").then((response)=> response.json())
        .then((data) => setUsers(data))
        .catch((error) => console.error("Error fetching users", error));
    }, []);
    const currentUser = {
        name: "Dohn goated Joe",
        detail: "dhffh rhrur kurhiuw uruf oioe uufr ueurowu"
    }
    return(
        <>
        <div>
            <h3>candidates</h3>
            <div>
                {users.map((user)=>(
                    <div key={user.id}>
                       <UserCards user = {user}/> 
                    </div>
                ))}
            </div>
            <UserCards user = {currentUser}/>
        </div>
        </>
    )
}


//learn try catch again, promises, throw backs and useEffect one more time
