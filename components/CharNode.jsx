import React from 'react';

const CharNode = React.memo(({ char, status }) => {
    let colorClass = 'text-gray-400';

    if (status === 'correct') {
        colorClass = 'text-green-500';
    } else if (status === 'incorrect') {
        // For spaces - background.
        // For text - text color.
        colorClass = char === ' ' ? 'bg-red-400/50' : 'text-red-500';
    }

    return <span className={`text-2xl font-mono ${colorClass}`}>{char}</span>;
});

CharNode.displayName = 'CharNode';

export default CharNode;
