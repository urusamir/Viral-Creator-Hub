const fs = require('fs');
const file = '/Users/munaaahmed/Downloads/viral-by-arc/Viral-Creator-Hub/client/src/pages/campaign-wizard.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove dnd import
content = content.replace('import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";\n', '');

// 2. Remove getStatusClasses and DeliverablesBoard
const startStr = 'const getStatusClasses = (status: string, isDragging: boolean, readOnly?: boolean) => {';
const endStr = 'function Step3({ campaign, updateField, readOnly }: StepProps) {';
const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);
if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + content.slice(endIndex);
}

// 3. Remove viewMode state
content = content.replace('  const [viewMode, setViewMode] = useState<"list" | "board">("list");\n', '');

// 4. Remove viewMode toggles (using broad string search)
const tsStartIdx = content.indexOf('<div className="flex items-center justify-between mb-4">');
const tsPIdx = content.indexOf('</p>', tsStartIdx);
const tsEndIdx = content.indexOf('</div>', tsPIdx + 4); 
if (tsStartIdx !== -1 && tsPIdx !== -1 && tsEndIdx !== -1) {
    // wait we just want to remove the viewMode toggle buttons which is right after the <p>
    const buttonsStart = content.indexOf('<div className="flex border border-border rounded-md overflow-hidden bg-background">', tsPIdx);
    const buttonsEnd = content.indexOf('</div>', buttonsStart) + 6;
    if (buttonsStart !== -1 && buttonsStart < tsEndIdx + 50) {
        content = content.slice(0, buttonsStart) + content.slice(buttonsEnd);
    }
}


// 5. Remove the conditional viewMode rendering wrappers
content = content.replace('{viewMode === "list" ? (\n              <div className="space-y-3">', '<div className="space-y-3">');

// 6. Remove the else branch and closing braces
const elseBranchIdxStart = content.indexOf('            ) : (\n              <DeliverablesBoard');
if(elseBranchIdxStart !== -1) {
    // find end of this else branch block
    const elseBranchIdxEnd = content.indexOf(')}', elseBranchIdxStart) + 2;
    content = content.slice(0, elseBranchIdxStart) + content.slice(elseBranchIdxEnd);
}

fs.writeFileSync(file, content);
console.log("Updated campaign-wizard.tsx successfully");
