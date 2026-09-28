
import { DataTypes, UUIDV4 } from "sequelize"
import db from "../config/db"

const Receipt = db.define("receipt", {
    id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        references: {
            model: "users",
            key: "id"
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
})

export default Receipt;