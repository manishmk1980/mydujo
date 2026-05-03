import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

// GET /pincodes/:pincode - Get city and state for a pincode
router.get("/:pincode", async (req, res) => {
    try {
        const { pincode } = req.params;

        // 1. Try to find in our database
        const lookup = await prisma.pincodeLookup.findUnique({
            where: { pincode }
        });

        if (lookup) {
            return res.json({
                success: true,
                data: {
                    city: lookup.city,
                    state: lookup.state,
                    source: 'local'
                }
            });
        }

        // 2. If not found, try external API (e.g., postalpincode.in)
        // Note: In production, you might want to cache this in your DB
        try {
            const externalRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const externalData = await externalRes.json();

            if (externalData && externalData[0] && externalData[0].Status === 'Success') {
                const postOffice = externalData[0].PostOffice[0];
                const city = postOffice.District;
                const state = postOffice.State;

                // Optionally save to local DB for future use
                await prisma.pincodeLookup.create({
                    data: { pincode, city, state }
                }).catch(err => console.error("Failed to cache pincode:", err));

                return res.json({
                    success: true,
                    data: { city, state, source: 'external' }
                });
            }
        } catch (e) {
            console.error("External pincode API failed:", e);
        }

        return res.status(404).json({ error: "Pincode not found" });
    } catch (err) {
        console.error("GET /pincodes/:pincode error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
