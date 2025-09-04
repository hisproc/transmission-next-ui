import { Card, CardContent } from "@/components/ui/card.tsx";
import { TransmissionSession } from "@/lib/api/types.ts";
import { useTranslation } from "react-i18next";

export default function About({ session }: { session: TransmissionSession }) {
    const { t } = useTranslation();
    const version = import.meta.env.VITE_APP_VERSION || "unknown";
    return (
        <div className="flex flex-1 items-center justify-center h-full">
            <Card>
                <CardContent>
                    <div className="text-center">
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400"><span className="text-sm font-bold text-black dark:text-white">{t("Transmission Version")}:</span> {session?.version}</p>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400"><span className="text-sm font-bold text-black dark:text-white">{t("UI Version")}:</span> {version}</p>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400"><span className="text-sm font-bold text-black dark:text-white">{t("RPC Version")}:</span> {session?.["rpc-version"]}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
