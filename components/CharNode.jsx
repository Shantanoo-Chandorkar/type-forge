import React from 'react';

const CharNode = React.memo(({ char, status }) => {
    let colorClass = 'text-[#aaaaaa]';

    if (status === 'correct') {
        colorClass = 'text-[#4a4a4a]';
    } else if (status === 'incorrect') {
        // Spaces show as background highlight; other characters show as red text.
        colorClass = char === ' ' ? 'bg-red-300/30' : 'text-[#c94040]';
    }

    return <span className={`text-2xl font-mono ${colorClass}`}>{char}</span>;
});

CharNode.displayName = 'CharNode';

export default CharNode;
