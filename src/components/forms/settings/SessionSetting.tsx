import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardFooter } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { useLocation } from "react-router-dom";
import { getSession } from "@/lib/api/transmissionClient.ts";
import { TransmissionSession } from "@/lib/api/types.ts";
import { NumericInput } from "@/components/forms/settings/NumbericInput.tsx";
import { usePortTest, useSetSession } from "@/hooks/useTorrentActions.ts";
import { Switch } from "@/components/ui/switch.tsx";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { STORAGE_KEYS } from "@/constants/storage.ts";
import { isFontAvailable } from "@/lib/utils/utils.ts";
import { toast } from "sonner";

export function SessionSetting() {
    const [uploadLimitEnabled, setUploadLimitEnabled] = useState(false);
    const [uploadLimit, setUploadLimit] = useState(0);
    const [downloadLimit, setDownloadLimit] = useState(0);
    const [downloadLimitEnabled, setDownloadLimitEnabled] = useState(false);
    const [incompleteEnabled, setIncompleteEnabled] = useState(false);
    const [incompleteDir, setIncompleteDir] = useState("");
    const [downloadDir, setDownloadDir] = useState("");
    const [renamePartialFiles, setRenamePartialFiles] = useState(false);
    const [peerPort, setPeerPort] = useState(0);
    const [randomPort, setRandomPort] = useState(false);
    const [utpEnabled, setUtpEnabled] = useState(false);
    const [portForwardingEnabled, setPortForwardingEnabled] = useState(false);
    const [cacheSize, setCacheSize] = useState(0);
    const [lpdEnabled, setLpdEnabled] = useState(false);
    const [dhtEnabled, setDhtEnabled] = useState(false);
    const [pexEnabled, setPexEnabled] = useState(false);
    const [downloadQueueEnabled, setDownloadQueueEnabled] = useState(false);
    const [seedQueueEnabled, setSeedQueueEnabled] = useState(false);
    const [downloadQueueSize, setDownloadQueueSize] = useState(0);
    const [seedQueueSize, setSeedQueueSize] = useState(0);
    const [queueStalledEnabled, setQueueStalledEnabled] = useState(false);
    const [queueStalledMinutes, setQueueStalledMinutes] = useState(0);
    const [seedRatioLimit, setSeedRatioLimit] = useState(0);
    const [seedRatioLimited, setSeedRatioLimited] = useState(false);
    const [idleSeedingLimit, setIdleSeedingLimit] = useState(0);
    const [idleSeedingLimitEnabled, setIdleSeedingLimitEnabled] = useState(false);
    const [clientNetworkSpeedSummary, setClientNetworkSpeedSummary] = useState(localStorage.getItem(STORAGE_KEYS.CLIENT_NETWORK_SPEED_SUMMARY) === "true");
    const CUSTOM_FONT_VALUE = "__custom__";

    const [uiFontFamily, setUiFontFamily] = useState<string>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.UI_FONT_FAMILY) || "";
        if (saved) {
            return CUSTOM_FONT_VALUE;
        }
        return "";
    });
    const [customFont, setCustomFont] = useState<string>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.UI_FONT_FAMILY) || "";
        if (saved) {
            return saved;
        }
        return "";
    });
    const [altSpeedDown, setAltSpeedDown] = useState(0);
    const [altSpeedUp, setAltSpeedUp] = useState(0);
    const [altSpeedEnabled, setAltSpeedEnabled] = useState(false);
    const [altSpeedTimeBegin, setAltSpeedTimeBegin] = useState(0);
    const [altSpeedTimeEnd, setAltSpeedTimeEnd] = useState(0);
    const [altSpeedTimeEnabled, setAltSpeedTimeEnabled] = useState(false);
    const [altSpeedTimeDay, setAltSpeedTimeDay] = useState(0);
    const setSession = useSetSession();
    const portTest = usePortTest();
    const { t } = useTranslation();
    const [encryption, setEncryption] = useState("");

    function minutesToTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    function timeToMinutes(time: string): number {
        const [hours, mins] = time.split(':').map(Number);
        return (hours || 0) * 60 + (mins || 0);
    }

    function isDayEnabled(dayMask: number, dayIndex: number): boolean {
        return (dayMask & (1 << dayIndex)) !== 0;
    }

    function toggleDay(dayMask: number, dayIndex: number): number {
        return dayMask ^ (1 << dayIndex);
    }

    function refreshData() {
        getSession().then((session: TransmissionSession) => {
            setUploadLimitEnabled(session?.["speed-limit-up-enabled"] ?? false);
            setDownloadLimitEnabled(session?.["speed-limit-down-enabled"] ?? false);
            setUploadLimit(session?.["speed-limit-up"] ?? 0);
            setDownloadLimit(session?.["speed-limit-down"] ?? 0);
            setIncompleteEnabled(session?.["incomplete-dir-enabled"] ?? false);
            setIncompleteDir(session?.["incomplete-dir"] ?? "");
            setDownloadDir(session?.["download-dir"] ?? "");
            setPeerPort(session?.["peer-port"] ?? 0);
            setRandomPort(session?.["peer-port-random-on-start"] ?? false);
            setUtpEnabled(session?.["utp-enabled"] ?? false);
            setRenamePartialFiles(session?.["rename-partial-files"] ?? false);
            setPortForwardingEnabled(session?.["port-forwarding-enabled"] ?? false);
            setCacheSize(session?.["cache-size-mb"] ?? 0);
            setLpdEnabled(session?.["lpd-enabled"] ?? false);
            setDhtEnabled(session?.["dht-enabled"] ?? false);
            setPexEnabled(session?.["pex-enabled"] ?? false);
            setEncryption(session?.["encryption"] ?? "required");
            setDownloadQueueEnabled(session?.["queue-stalled-enabled"] ?? false);
            setSeedQueueEnabled(session?.["seed-queue-enabled"] ?? false);
            setDownloadQueueSize(session?.["download-queue-size"] ?? 0);
            setSeedQueueSize(session?.["seed-queue-size"] ?? 0);
            setQueueStalledEnabled(session?.["queue-stalled-enabled"] ?? false);
            setQueueStalledMinutes(session?.["queue-stalled-minutes"] ?? 0);
            setSeedRatioLimit(session?.["seedRatioLimit"] ?? 0);
            setSeedRatioLimited(session?.["seedRatioLimited"] ?? false);
            setIdleSeedingLimit(session?.["idle-seeding-limit"] ?? 0);
            setIdleSeedingLimitEnabled(session?.["idle-seeding-limit-enabled"] ?? false);
            setAltSpeedDown(session?.["alt-speed-down"] ?? 0);
            setAltSpeedUp(session?.["alt-speed-up"] ?? 0);
            setAltSpeedEnabled(session?.["alt-speed-enabled"] ?? false);
            setAltSpeedTimeBegin(session?.["alt-speed-time-begin"] ?? 0);
            setAltSpeedTimeEnd(session?.["alt-speed-time-end"] ?? 0);
            setAltSpeedTimeEnabled(session?.["alt-speed-time-enabled"] ?? false);
            setAltSpeedTimeDay(session?.["alt-speed-time-day"] ?? 0);
        });
    }


    const location = useLocation();
    useEffect(() => { refreshData() }, [location]);
    return (
        <>
            <Tabs defaultValue="bandwidth" className="px-4 space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="bandwidth">{t("Bandwidth")}</TabsTrigger>
                    <TabsTrigger value="network">{t("Network")}</TabsTrigger>
                    <TabsTrigger value="storage">{t("Storage")}</TabsTrigger>
                    <TabsTrigger value="queue">{t("Queue")}</TabsTrigger>
                    <TabsTrigger value="ui">{t("UI")}</TabsTrigger>
                </TabsList>
                <TabsContent value="bandwidth">
                    <Card>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">{t("Bandwidth Limits")}</h3>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center space-x-4 xl:w-1/2">
                                    <Label htmlFor="upload-limit-enabled" className="whitespace-nowrap w-30">{t("Upload limit")}</Label>
                                    <Switch
                                        id="upload-limit-enabled"
                                        checked={uploadLimitEnabled}
                                        onCheckedChange={(checked) => setUploadLimitEnabled(!!checked)}
                                    />
                                    <div className="flex items-center space-x-2 ml-auto">
                                        <NumericInput
                                            id="upload-limit"
                                            value={uploadLimit}
                                            onChange={setUploadLimit}
                                            className="w-32"
                                            disabled={!uploadLimitEnabled}
                                        />
                                        <span className="text-sm text-muted-foreground">{t("KB/s")}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 xl:w-1/2">
                                    <Label htmlFor="download-limit-enabled" className="whitespace-nowrap w-30">{t("Download limit")}</Label>
                                    <Switch
                                        id="download-limit-enabled"
                                        checked={downloadLimitEnabled}
                                        onCheckedChange={(checked) => setDownloadLimitEnabled(!!checked)}
                                    />
                                    <div className="flex items-center space-x-2 ml-auto">
                                        <NumericInput
                                            id="download-limit"
                                            value={downloadLimit}
                                            onChange={setDownloadLimit}
                                            className="w-32"
                                            disabled={!downloadLimitEnabled}
                                        />
                                        <span className="text-sm text-muted-foreground">{t("KB/s")}</span>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div>
                                <h3 className="text-lg font-medium">{t("Alternative Bandwidth Limits")}</h3>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center space-x-4 xl:w-1/2">
                                    <Label htmlFor="alt-speed-enabled" className="whitespace-nowrap w-50">{t("Enable alternative speed")}</Label>
                                    <Switch
                                        id="alt-speed-enabled"
                                        checked={altSpeedEnabled}
                                        onCheckedChange={(checked) => setAltSpeedEnabled(!!checked)}
                                    />
                                </div>
                                <div className="flex items-center space-x-4 xl:w-1/2">
                                    <Label htmlFor="alt-upload-limit-enabled" className="whitespace-nowrap w-30">{t("Alternative upload limit")}</Label>
                                    <div className="flex items-center space-x-2 ml-auto">
                                        <NumericInput
                                            id="alt-upload-limit"
                                            value={altSpeedUp}
                                            onChange={setAltSpeedUp}
                                            className="w-32"
                                            disabled={!altSpeedEnabled}
                                        />
                                        <span className="text-sm text-muted-foreground">{t("KB/s")}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 xl:w-1/2">
                                    <Label htmlFor="alt-download-limit-enabled" className="whitespace-nowrap w-50">{t("Alternative download limit")}</Label>
                                    <div className="flex items-center space-x-2 ml-auto">
                                        <NumericInput
                                            id="alt-download-limit"
                                            value={altSpeedDown}
                                            onChange={setAltSpeedDown}
                                            className="w-32"
                                            disabled={!altSpeedEnabled}
                                        />
                                        <span className="text-sm text-muted-foreground">{t("KB/s")}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-md font-medium">{t("Scheduled times")}</h4>
                                </div>
                                <div className="flex items-center space-x-4 xl:w-1/2">
                                    <Label htmlFor="alt-speed-time-enabled" className="whitespace-nowrap w-50">{t("Enable scheduled times")}</Label>
                                    <Switch
                                        id="alt-speed-time-enabled"
                                        checked={altSpeedTimeEnabled}
                                        onCheckedChange={(checked) => setAltSpeedTimeEnabled(!!checked)}
                                    />
                                </div>
                                <div className="flex items-center space-x-4 xl:w-1/2">
                                    <Label htmlFor="alt-speed-time-begin" className="whitespace-nowrap w-30">{t("Start time")}</Label>
                                    <div className="flex items-center space-x-2 ml-auto">
                                        <Input
                                            id="alt-speed-time-begin"
                                            type="time"
                                            value={minutesToTime(altSpeedTimeBegin)}
                                            onChange={(e) => setAltSpeedTimeBegin(timeToMinutes(e.target.value))}
                                            className="w-32"
                                            disabled={!altSpeedTimeEnabled}
                                        />
                                    </div>    
                                </div>
                                <div className="flex items-center space-x-4 xl:w-1/2">
                                    <Label htmlFor="alt-speed-time-end" className="whitespace-nowrap w-30">{t("End time")}</Label>
                                    <div className="flex items-center space-x-2 ml-auto">
                                        <Input
                                            id="alt-speed-time-end"
                                            type="time"
                                            value={minutesToTime(altSpeedTimeEnd)}
                                            onChange={(e) => setAltSpeedTimeEnd(timeToMinutes(e.target.value))}
                                            className="w-32"
                                            disabled={!altSpeedTimeEnabled}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-3 xl:w-1/2">
                                    <Label className="text-sm font-medium">{t("Days")}</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                        {[
                                            { key: "Sunday", index: 0 },
                                            { key: "Monday", index: 1 },
                                            { key: "Tuesday", index: 2 },
                                            { key: "Wednesday", index: 3 },
                                            { key: "Thursday", index: 4 },
                                            { key: "Friday", index: 5 },
                                            { key: "Saturday", index: 6 }
                                        ].map(({ key, index }) => (
                                            <div 
                                                key={key} 
                                                className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                                            >
                                                <Checkbox
                                                    id={`alt-speed-day-${index}`}
                                                    checked={isDayEnabled(altSpeedTimeDay, index)}
                                                    onCheckedChange={() => setAltSpeedTimeDay(toggleDay(altSpeedTimeDay, index))}
                                                    disabled={!altSpeedTimeEnabled}
                                                />
                                                <Label 
                                                    htmlFor={`alt-speed-day-${index}`} 
                                                    className="text-sm font-normal cursor-pointer flex-1 leading-none"
                                                >
                                                    {t(key)}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div>
                                <h3 className="text-lg font-medium">{t("Seeding Limits")}</h3>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center space-x-4 xl:w-1/2">
                                    <Label htmlFor="seed-ratio-limit-enabled" className="whitespace-nowrap w-50">{t("Seed ratio limit")}</Label>
                                    <Switch
                                        id="seed-ratio-limit-enabled"
                                        checked={seedRatioLimited}
                                        onCheckedChange={(checked) => setSeedRatioLimited(!!checked)}
                                    />
                                    <div className="flex items-center space-x-2 ml-auto">
                                        <NumericInput
                                            id="seed-ratio-limit"
                                            value={seedRatioLimit}
                                            onChange={setSeedRatioLimit}
                                            className="w-32"
                                            disabled={!seedRatioLimited}
                                        />
                                        <span className="text-sm text-muted-foreground invisible">{t("minutes")}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 xl:w-1/2">
                                    <Label htmlFor="idle-seeding-limit-enabled" className="whitespace-nowrap w-50">{t("Idle seeding limit")}</Label>
                                    <Switch
                                        id="idle-seeding-limit-enabled"
                                        checked={idleSeedingLimitEnabled}
                                        onCheckedChange={(checked) => setIdleSeedingLimitEnabled(!!checked)}
                                    />
                                    <div className="flex items-center space-x-2 ml-auto">
                                        <NumericInput
                                            id="idle-seeding-limit"
                                            value={idleSeedingLimit}
                                            onChange={setIdleSeedingLimit}
                                            className="min-w-16 max-w-32"
                                            disabled={!idleSeedingLimitEnabled}
                                        />
                                        <span className="text-sm text-muted-foreground">{t("minutes")}</span>
                                    </div>
                                </div>
                                <hr />
                            </div>

                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => {
                                setSession.mutate({
                                    "speed-limit-up": uploadLimit,
                                    "speed-limit-up-enabled": uploadLimitEnabled,
                                    "speed-limit-down": downloadLimit,
                                    "speed-limit-down-enabled": downloadLimitEnabled,
                                    "alt-speed-up": altSpeedUp,
                                    "alt-speed-down": altSpeedDown,
                                    "alt-speed-enabled": altSpeedEnabled,
                                    "alt-speed-time-begin": altSpeedTimeBegin,
                                    "alt-speed-time-end": altSpeedTimeEnd,
                                    "alt-speed-time-enabled": altSpeedTimeEnabled,
                                    "alt-speed-time-day": altSpeedTimeDay,
                                    "seedRatioLimit": seedRatioLimit,
                                    "seedRatioLimited": seedRatioLimited,
                                    "idle-seeding-limit": idleSeedingLimit,
                                    "idle-seeding-limit-enabled": idleSeedingLimitEnabled,
                                });
                            }}>{t("Save changes")}</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="storage">
                    <Card>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">{t("Directory Settings")}</h3>
                            </div>
                            <div className="flex flex-col xl:flex-row w-full gap-2">
                                <div className="flex items-center w-full xl:w-1/3">
                                    <Label className="whitespace-nowrap" htmlFor="download-dir">{t("Download Directory")}</Label>
                                </div>
                                <div className="flex items-center w-full xl:w-2/3">
                                    <Input id="download-dir" className="mt-2 sm:mt-0" type="text" value={downloadDir} onChange={(e) => setDownloadDir(e.target.value)} />
                                </div>
                            </div>
                            <div className="flex flex-col xl:flex-row w-full gap-2">
                                <div className="flex items-center w-full xl:w-1/3 gap-4">
                                    <Label className="whitespace-nowrap" htmlFor="incomplete-dir-enabled">{t("Use incomplete directory")}</Label>
                                    <Switch
                                        id="incomplete-dir-enabled"
                                        checked={incompleteEnabled}
                                        onCheckedChange={(checked) => setIncompleteEnabled(!!checked)}
                                    />
                                </div>
                                <div className="flex items-center w-full xl:w-2/3">
                                    <Input id="incomplete-dir" className="mt-2 sm:mt-0" type="text" placeholder="/incomplete" disabled={!incompleteEnabled} value={incompleteDir} onChange={(e) => setIncompleteDir(e.target.value)} />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Label htmlFor="rename-partial-files">{t("Rename partial files with .part")}</Label>
                                <Switch id="rename-partial-files" checked={renamePartialFiles} onCheckedChange={(checked) => setRenamePartialFiles(!!checked)} />
                            </div>

                            <hr />

                            <div>
                                <h3 className="text-lg font-medium">{t("Disk Settings")}</h3>
                            </div>
                            <div className="flex flex-col xl:flex-row w-full gap-2">
                                <div className="flex items-center w-full xl:w-1/3">
                                    <Label className="whitespace-nowrap" htmlFor="cache-size">{t("Disk cache size")}</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <NumericInput id="cache-size" className="mt-2 sm:mt-0" value={cacheSize} onChange={setCacheSize} />
                                    <span className="text-sm text-muted-foreground">{t("MB")}</span>
                                </div>
                            </div>

                            <hr />

                        </CardContent>
                        <CardFooter>
                            <Button onClick={
                                () => {
                                    setSession.mutate({
                                        "download-dir": downloadDir,
                                        "incomplete-dir": incompleteDir,
                                        "incomplete-dir-enabled": incompleteEnabled,
                                        "rename-partial-files": renamePartialFiles,
                                        "cache-size-mb": cacheSize,
                                    });
                                }
                            }>{t("Save changes")}</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="network">
                    <Card>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">{t("Peer Setting")}</h3>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center space-x-4 xl:w-1/2">
                                    <Label htmlFor="upload-limit-enabled" className="whitespace-nowrap w-30">{t("Peer Port")}</Label>
                                    <div className="flex items-center space-x-4 flex-1">
                                        <Input
                                            className="w-32"
                                            id="peer-port"
                                            type="number"
                                            disabled={randomPort}
                                            value={peerPort}
                                            onChange={(e) => setPeerPort(parseInt(e.target.value))}
                                        />
                                        <Switch
                                            id="random-port"
                                            checked={randomPort}
                                            onCheckedChange={(checked) => setRandomPort(!!checked)}
                                        />
                                        <Label htmlFor="random-port">{t("Random")}</Label>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 xl:w-1/2">
                                    <Label htmlFor="port-forwarding-enabled" className="whitespace-nowrap w-66">{t("Port forwarding")}</Label>
                                    <Switch
                                        id="port-forwarding-enabled"
                                        checked={portForwardingEnabled}
                                        onCheckedChange={(checked) => setPortForwardingEnabled(!!checked)}
                                    />
                                </div>
                                <div className="flex items-center space-x-4 xl:w-1/2">
                                    <Label htmlFor="lpd-enabled" className="whitespace-nowrap w-66">{t("Enable Local Peer Discovery")}</Label>
                                    <Switch
                                        id="lpd-enabled"
                                        checked={lpdEnabled}
                                        onCheckedChange={(checked) => setLpdEnabled(!!checked)}
                                    />
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Label htmlFor="dht-enabled" className="whitespace-nowrap w-66">{t("Enable DHT")}</Label>
                                    <Switch
                                        id="dht-enabled"
                                        checked={dhtEnabled}
                                        onCheckedChange={(checked) => setDhtEnabled(!!checked)}
                                    />
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Label htmlFor="pex-enabled" className="whitespace-nowrap w-66">{t("Enable Peer Exchange")}</Label>
                                    <Switch
                                        id="pex-enabled"
                                        checked={pexEnabled}
                                        onCheckedChange={(checked) => setPexEnabled(!!checked)}
                                    />
                                </div>
                                <hr />
                                <div>
                                    <h3 className="text-lg font-medium">{t("Protocol Settings")}</h3>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Label htmlFor="utp-enabled" className="whitespace-nowrap w-66">{t("Enable uTP")}</Label>
                                    <Switch
                                        id="utp-enabled"
                                        checked={utpEnabled}
                                        onCheckedChange={(checked) => setUtpEnabled(!!checked)}
                                    />
                                </div>
                                <hr />
                                <div>
                                    <h3 className="text-lg font-medium">{t("Encryption Settings")}</h3>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Label htmlFor="encryption" className="whitespace-nowrap w-66">{t("Encryption Options")}</Label>
                                    <Select
                                        value={encryption}
                                        onValueChange={(value) => setEncryption(value)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder={t("Encryption")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="required">{t("Required Encryption")}</SelectItem>
                                            <SelectItem value="preferred">{t("Preferred Encryption")}</SelectItem>
                                            <SelectItem value="tolerated">{t("Tolerated Encryption")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <hr />
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => {
                                setSession.mutate({
                                    "peer-port": peerPort,
                                    "peer-port-random-on-start": randomPort,
                                    "port-forwarding-enabled": portForwardingEnabled,
                                    "utp-enabled": utpEnabled,
                                    "lpd-enabled": lpdEnabled,
                                    "dht-enabled": dhtEnabled,
                                    "pex-enabled": pexEnabled,
                                    "encryption": encryption,
                                });
                            }
                            }>{t("Save changes")}</Button>
                            <Button
                                variant="secondary"
                                className="ml-4"
                                onClick={() => {
                                    portTest.mutate({ "ip_protocol": "ipv4" });
                                }}
                            >
                                {t("Test port")}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="queue">
                    <Card>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">{t("Queue Settings")}</h3>
                            </div>
                            <div className="flex items-center space-x-4 xl:w-1/2">
                                <Label htmlFor="download-queue-enabled" className="whitespace-nowrap w-30">{t("Download Queue")}</Label>
                                <div className="flex items-center space-x-4 flex-1">
                                    <Switch
                                        id="download-queue-enabled"
                                        checked={downloadQueueEnabled}
                                        onCheckedChange={(checked) => setDownloadQueueEnabled(!!checked)}
                                    />
                                    <Input
                                        className="w-32"
                                        id="peer-port"
                                        type="number"
                                        disabled={!downloadQueueEnabled}
                                        value={downloadQueueSize}
                                        onChange={(e) => setDownloadQueueSize(parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 xl:w-1/2">
                                <Label htmlFor="upload-queue-enabled" className="whitespace-nowrap w-30">{t("Upload Queue")}</Label>
                                <div className="flex items-center space-x-4 flex-1">
                                    <Switch
                                        id="upload-queue-enabled"
                                        checked={seedQueueEnabled}
                                        onCheckedChange={(checked) => setSeedQueueEnabled(!!checked)}
                                    />
                                    <Input
                                        className="w-32"
                                        id="peer-port"
                                        type="number"
                                        disabled={!seedQueueEnabled}
                                        value={seedQueueSize}
                                        onChange={(e) => setSeedQueueSize(parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-y-2 items-center space-x-4 xl:w-1/2">
                                <Label htmlFor="queue-stalled-enabled">{t("Consider idle torrents as stalled after")}</Label>
                                <div className="flex items-center space-x-4 flex-1">
                                    <Switch
                                        id="queue-stalled-enabled"
                                        checked={queueStalledEnabled}
                                        onCheckedChange={(checked) => setQueueStalledEnabled(!!checked)}
                                    />
                                    <Input
                                        className="w-32"
                                        id="peer-port"
                                        type="number"
                                        disabled={!queueStalledEnabled}
                                        value={queueStalledMinutes}
                                        onChange={(e) => setQueueStalledMinutes(parseInt(e.target.value))}
                                    />
                                    <span className="text-sm text-muted-foreground">{t("minutes")}</span>
                                </div>
                            </div>
                            <hr />

                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => {
                                setSession.mutate({
                                    "queue-stalled-enabled": queueStalledEnabled,
                                    "queue-stalled-minutes": queueStalledMinutes,
                                    "download-queue-size": downloadQueueSize,
                                    "seed-queue-size": seedQueueSize,
                                    "download-queue-enabled": downloadQueueEnabled,
                                    "seed-queue-enabled": seedQueueEnabled,
                                });
                            }
                            }>{t("Save changes")}</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="ui">
                    <Card>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">{t("UI Settings")}</h3>
                            </div>
                            <div className="flex items-center space-x-4 xl:w-1/2">
                                <Label htmlFor="show-additional-tracker" className="whitespace-nowrap w-66">{t("Client Network Speed Summary")}</Label>
                                <Switch
                                    id="client-network-speed-summary"
                                    checked={clientNetworkSpeedSummary}
                                    onCheckedChange={(checked) => setClientNetworkSpeedSummary(!!checked)}
                                />
                            </div>
                            <div className="flex items-center space-x-4 xl:w-1/2">
                                <Label htmlFor="ui-font-family" className="whitespace-nowrap w-66">
                                    {t("UI Font")}
                                </Label>
                                <Select
                                    value={uiFontFamily || "default"}
                                    onValueChange={(value) => {
                                        if (value === "default") {
                                            setUiFontFamily("");
                                        } else if (value === CUSTOM_FONT_VALUE) {
                                            setUiFontFamily(CUSTOM_FONT_VALUE);
                                        } else {
                                            setUiFontFamily(value);
                                        }
                                    }}
                                >
                                    <SelectTrigger id="ui-font-family" className="w-[260px]">
                                        <SelectValue placeholder={t("Select UI Font")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">default</SelectItem>
                                        <SelectItem value={CUSTOM_FONT_VALUE}>
                                            {customFont ? `Custom: ${customFont}` : t("Custom Font Family")}
                                        </SelectItem>
                                        <div
                                            className="px-2 py-2 border-t border-border"
                                            onPointerDown={(event) => {
                                                event.preventDefault();
                                            }}
                                        >
                                            <Label htmlFor="ui-font-custom" className="text-xs font-medium text-muted-foreground">
                                                {t("Custom Font Family")}
                                            </Label>
                                            <Input
                                                id="ui-font-custom"
                                                className="mt-2 h-8"
                                                placeholder="e.g. MiSans, system-ui, sans-serif"
                                                value={customFont}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setCustomFont(value);
                                                }}
                                                onKeyDown={(event) => {
                                                    event.stopPropagation();
                                                }}
                                                onPointerDown={(event) => {
                                                    event.stopPropagation();
                                                }}
                                            />
                                        </div>
                                    </SelectContent>
                                </Select>
                            </div>
                            <hr />
                        </CardContent>
                        <CardFooter>
                            <Button onClick={
                                () => {
                                    localStorage.setItem(STORAGE_KEYS.CLIENT_NETWORK_SPEED_SUMMARY, clientNetworkSpeedSummary ? "true" : "false");

                                    let finalFont = "";
                                    let usedCustomFallback = false;

                                    const trimmedCustom = customFont.trim();

                                    if (uiFontFamily === CUSTOM_FONT_VALUE && trimmedCustom) {
                                        const primaryName = trimmedCustom.split(",")[0].trim().replace(/^['"]|['"]$/g, "");
                                        if (primaryName && isFontAvailable(primaryName)) {
                                            finalFont = `'${primaryName}'`;
                                        } else {
                                            finalFont = "";
                                            usedCustomFallback = true;
                                        }
                                    } else if (uiFontFamily && uiFontFamily !== CUSTOM_FONT_VALUE) {
                                        finalFont = uiFontFamily;
                                    }

                                    if (finalFont) {
                                        localStorage.setItem(STORAGE_KEYS.UI_FONT_FAMILY, finalFont);
                                        document.documentElement.style.setProperty("--app-font-family", finalFont);
                                    } else {
                                        localStorage.removeItem(STORAGE_KEYS.UI_FONT_FAMILY);
                                        document.documentElement.style.removeProperty("--app-font-family");
                                    }

                                    if (usedCustomFallback) {
                                        toast.error(t("Custom font not available, fallback to default"), {
                                            position: "top-right",
                                        });
                                    } else {
                                        toast.success(t("UI Settings updated"), {
                                            position: "top-right",
                                        });
                                    }
                                }
                            }>{t("Save changes")}</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    )
}