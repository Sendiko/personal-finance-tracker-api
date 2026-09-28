import { Request, Response } from "express";
import Receipt from "./receipt";


const ReceiptController = {
    index: async (req: Request, res: Response) => {
        const receipts = await Receipt.findAll({
            where: {
                userId: req.params.userId
            }
        });

        return res.status(200).json({
            status: 200,
            message: "Receipts sent successfully",
            receipts: receipts
        })
    },
    store: async(req: Request, res: Response) => {
        try {
            await Receipt.create(req.body);

            return res.status(201).json({
                status: 201,
                message: "Receipt successfully uploaded!"
            })
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: "Server error: " + error
            })
        }
    },
    count: async (req: Request, res: Response) => {
        try {
            const count = await Receipt.count();

            return res.status(200).json({
                status: 200,
                message: "Receipt count sent successfully",
                count: count
            })
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: "Server error: " + error
            })
        }
    }
}

export default ReceiptController;