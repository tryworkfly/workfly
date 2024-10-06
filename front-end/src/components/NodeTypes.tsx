import { useMemo } from "react";
import ActionCardNode from "./ActionCard";
import JobCardNode from "./JobCard";

const nodeTypes = {
    actionNode: ActionCardNode,
    jobNode: JobCardNode,
};

export default nodeTypes;