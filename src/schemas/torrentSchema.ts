import { z } from "zod";

export const schema = z.object({
    id: z.number(),
    name: z.string(),
    totalSize: z.number(),
    percentDone: z.number(),
    status: z.number(),
    rateDownload: z.number(),
    rateUpload: z.number(),
    uploadRatio: z.number(),
    uploadedEver: z.number(),
    peersGettingFromUs: z.number(),
    downloadDir: z.string(),
    addedDate: z.number(),
    error: z.number(),
    eta: z.number(),
    errorString: z.string(),
    peersSendingToUs: z.number(),
    labels: z.array(z.string()).default([]),
    trackerStats: z.array(z.object({
        host: z.string(),
        seederCount: z.number(),
        leecherCount: z.number(),
    })),
})

export type torrentSchema = z.infer<typeof schema>;