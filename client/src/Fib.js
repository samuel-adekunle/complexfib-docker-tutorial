import React, {useEffect, useState} from "react";
import axios from "axios";

export default function Fib() {
    const [seenIndexes, setSeenIndexes] = useState([])
    const [values, setValues] = useState({})
    const [index, setIndex] = useState("")

    const fetchValues = async () => {
        const values = await axios.get("/api/values/current")
        setValues(values.data)
    }

    const fetchIndexes = async () => {
        const seenIndexes = await axios.get("/api/values/all")
        setSeenIndexes(seenIndexes.data)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        await axios.post("/api/values", {index})
        setIndex("")

    }

    useEffect(() => {
        fetchValues()
        fetchIndexes()
    }, [])

    return <div>
        <form onSubmit={handleSubmit}>
            <label>Enter your index: </label>
            <input type="number" name="index" min="0" max="40" value={index} onChange={e => setIndex(e.target.value)}/>
            <button>Submit</button>
        </form>

        <h3>Indexes I have seen:</h3>
        <div>
            {seenIndexes.join(", ")}
        </div>

        <h3>Calculated Values:</h3>
        {Object.entries(values).map(([index, value]) => <div key={index}>For index {index}, I calculated {value}</div>)}
    </div>
}