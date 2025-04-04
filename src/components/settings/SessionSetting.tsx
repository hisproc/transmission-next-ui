import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useLocation } from "react-router-dom";
import { getSession } from "@/lib/transmissionClient";
import { TransmissionSession } from "@/lib/types";
import { NumericInput } from "@/components/settings/NumbericInput";
import { usePortTest, useSetSession } from "../../hooks/useTorrentActions";
import { Switch } from "../ui/switch";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


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
    const setSession = useSetSession();
    const portTest = usePortTest();
    const { t } = useTranslation();
    const [encryption, setEncryption] = useState("");

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
        });
    }


    const location = useLocation();
    useEffect(() => { refreshData() }, [location]);
    return (
        <>
            <Tabs defaultValue="bandwidth" className="px-4 space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="bandwidth">{t("Bandwidth")}</TabsTrigger>
                    <TabsTrigger value="network">{t("Network")}</TabsTrigger>
                    <TabsTrigger value="storage">{t("Storage")}</TabsTrigger>
                    <TabsTrigger value="queue">{t("Queue")}</TabsTrigger>
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
            </Tabs>
        </>
    )
}