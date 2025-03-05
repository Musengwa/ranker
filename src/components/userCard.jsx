import { useState } from "react";
export default function UserCards({user}) {
    const attr = [
        {
            id: 1,
            icon: "icon",
            name: "john doe",
            detail: "attribute details",
        },
        {
            id: 2,
            icon: "icon",
            name: "john doe",
            detail: "attribute details",
        },
        {
            id: 3,
            icon: "icon",
            name: "john doe",
            detail: "attribute details",
        },
        {
            id: 4,
            icon: "icon",
            name: "john doe",
            detail: "attribute details",
        },
        {
            id: 5,
            icon: "icon",
            name: "john doe",
            detail: "attribute details",
        },
        {
            id: 6,
            icon: "icon",
            name: "john doe",
            detail: "attribute details",
        },
    ]
    return (
        <>
            <div>
                <div>
                    <h1> {user.name}</h1>
                    <p>{user.detail}</p>
                </div>
                <div>
                    {
                        attr.map((atr) => (

                            <div>
                                <div key={atr.id}>
                                    <Attribute atrb={atr} />
                                </div>
                            </div>

                        ))
                    }
                </div>
            </div>
        </>
    )
}
function Attribute({ atrb }) {
    const [attribute, setAttribute] = useState("");
    const [displayDetails, setDisplayDetails] = useState(false);

    const handleAttributeDetail = () => {
        setDisplayDetails((prev) => !prev); // Toggle displayDetails correctly
    };

    const handleAttributeValue = (event) => {
        setAttribute(event.target.value);
    };

    return (
        <>
            <div>
                <div>{atrb.icon}</div>
                <label onClick={handleAttributeDetail} style={{ cursor: "pointer" }}>
                    {atrb.name}
                </label>
                <input type="number" placeholder={atrb.name} value={attribute} onChange={handleAttributeValue} />
                {displayDetails && (
                    <div>
                        <button onClick={() => setDisplayDetails(false)}>x</button>
                        <p>{atrb.detail}</p>
                    </div>
                )}
            </div>
        </>
    );
}