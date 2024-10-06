'use client';
import React, { useCallback, useEffect } from 'react';
import {
   ReactFlow,
   useNodesState,
   useEdgesState,
   addEdge,
   Controls,
   Background,
   BackgroundVariant,
   Edge,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { ActionCardNode } from '@/components/ActionCard';
import nodeTypes from '@/components/NodeTypes';

const initialNodes: ActionCardNode[] = [
   { id: '1', type: "actionNode", draggable: true, connectable: false, deletable: false, position: { x: 0, y: 0 }, data: {
      name: 'Action 1',
      description: 'This is the first action',
      isDefault: true,
      inputs: [
         { name: 'input1', description: 'This is the first input', type: 'string', required: true },
         { name: 'input2', description: 'This is the second input', type: 'number', required: false },
      ],
   } },
   { id: '2', type: "actionNode", draggable: true, connectable: false, deletable: false, position: { x: 0, y: 100 }, data: { 
      name: 'Action 2',
      description: 'This is the second action',
      isDefault: true,
      inputs: [
         { name: 'input1', description: 'This is the first input', type: 'string', required: true },
         { name: 'input2', description: 'This is the second input', type: 'boolean', required: false },
      ],
   } },
];

const initialEdges: Edge[] = [];

export default function Playground() {
   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

   const onConnect = useCallback(
      (params: any) => setEdges((eds) => addEdge(params, eds)),
      [setEdges],
   );

   return (
      <div style={{ width: '100vw', height: '100vh' }}>
         <ReactFlow
            nodeTypes={nodeTypes}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
         >
            <Controls />
            <Background color="#ccc" variant={BackgroundVariant.Cross} />
         </ReactFlow>
      </div>
   );
}
