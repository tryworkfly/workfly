import { useMemo } from "react";
import ActionCardNode from "./ActionCard";
import JobCardNode from "./JobCard";
import TriggerCardNode from "./TriggerCard";

const nodeTypes = {
    actionNode: ActionCardNode,
    jobNode: JobCardNode,
    triggerNode: TriggerCardNode,
};

export default nodeTypes;