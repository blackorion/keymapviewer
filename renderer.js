import React, { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';

const CODES = {
    command: '⌘',
    option: '⌥',
    control: '^',
    shift: '⇧',
    leftArrow: '←',
    rightArrow: '→',
    upArrow: '↑',
    downArrow: '↓',
    enter: '⏎',
    space: 'SPC',
    backspace: '⌫',
    delete: 'DEL'
};

function useApplicationConfig() {
    const [config, setConfig] = useState(null);

    useEffect(() => {
        window.api.listen((config) => setConfig(config));
    }, []);

    return { config };
}

const App = () => {
    const { config } = useApplicationConfig();

    if (!config)
        return <div>loading</div>;

    return <Layout config={config}/>;
};

const Layout = ({ config }) => (
    <div className={'container mx-auto sm:px-6 lg:px-8'}>
        <div className={'py-4'}>
            <h1 className="text-3xl font-bold leading-tight text-gray-900">{config.title}</h1>
        </div>
        <div className={'mt-6'}>
            {
                config.keymap
                    ? <Keymap keymap={config.keymap}/>
                    : <div>no keymap</div>
            }
        </div>
    </div>
);

const Keymap = ({ keymap }) => {
    const items = (Array.isArray(keymap))
        ? keymap
        : Object.entries(keymap).map(([key, value]) => ({ description: key, keys: [value], type: 'shortcut' }));

    return (
        <ul role={'list'} className={'mt-3 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-3 divide-y divide-gray-200'}>
            {items
                .sort((a, b) => a.description.localeCompare(b.description))
                .map(it => <ListItem key={it.description} item={it}/>)}
        </ul>
    );
};

const ListItem = ({ item }) => {
    const ItemComponent = (item.type === 'shortcut' || !item.type)
        ? ShortcutListItem
        : GroupListItem;

    return (
        <li className={'flex justify-between py-1'}>
            <ItemComponent {...item}/>
        </li>
    );
};

const GroupListItem = ({ description, keymap }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
        <div className="px-4 py-5 sm:px-6">
            <h2 className={'text-xl font-semibold leading-tight text-gray-900'}>{description}</h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
            <Keymap keymap={keymap}/>
        </div>
    </div>
);

const ShortcutListItem = ({ keys, description }) => (
    <>
        <span className={'text-lg leading-loose'}>{description}</span>
        <span className={'space-x-1'}><Shortcut value={keys}/></span>
    </>
);

const Shortcut = ({ value }) => {
    const shortcut = (Array.isArray(value))
        ? value.map(char => {
            if (Array.isArray(char))
                return `(${char.map(it => CODES[it] || it).join(' or')})`;

            return CODES[char] || char;
        })
        : [value];

    return shortcut.map(it =>
        <span key={it}
              className={'font-bold bg-gray-100 text-xl text-gray-900 justify-center items-center py-2 px-1 rounded-sm uppercase'}>{it}</span>
    );
};

const root = document.getElementById('root');
ReactDOM.render(<App/>, root);