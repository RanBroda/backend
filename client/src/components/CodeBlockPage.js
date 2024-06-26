// CodeBlockPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { Editor } from '@monaco-editor/react';


import * as PropTypes from "prop-types";

const socket = io('http://localhost:3001'); // Adjust the URL as needed




const CodeBlockPage = () => {
    const { id } = useParams();
    // בהגדרה של סטייטים, אתה רוצה לשמור בקומפוננט מידע באופן דינאמי, הקוד בלוק יהיה הקוד עצמו, ובכל פעם שהמשתמש ירשום משהו חדש נפעיל את סט קוד בלוק. ההגדרה הראשונית של קודבלוק יהיה נאל.
    const [codeBlock, setCodeBlock] = useState(null);
    // אותו הדבר, רק עבור טעינה. הברירת מחדל זה שהוא בלודינג.
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('');
    const [ID, setID] = useState(id);
    const IDD = id
    useEffect(() => {
        console.log('Fetching code block for title:', id);
        fetch(`/code-block/${id}`)
            .then(response => response.json())
            .then(data => {
                console.log('Data received:', data);
                console.log('code:', data.code);
                setCodeBlock(data);
                setCode(data.code);
                setID(data.id);
                setLoading(false);
                socket.emit('join-room', data._id); // Join the room based on the code block title
            })
            .catch(error => {
                console.error('Error fetching code block:', error);
                setLoading(false);
            });

        // Handle code updates from other clients
        socket.on('code-update', (newCode) => {
            setCode(newCode);
        });

        // Cleanup on unmount
        return () => {
            socket.off('code-update');
            socket.emit('leave-room'); // Leave the room when component unmounts
        };
    }, [id]);


        const handleCodeChange = (newCode) => {
            setCode(newCode);
            socket.emit('code-change', {room: id, code: newCode});
        };

        if (loading) {
            return <div>Loading...</div>;
        }

        if (!codeBlock) {
            return <div>Code block not found</div>;
        }

        return (
            <div>
                <h1>{codeBlock.title}</h1>
                <Editor
                    height="200px"
                    language="javascript"
                    value={code}
                    onChange={(e) => handleCodeChange(e)}
                />
            </div>
        );
};

export default CodeBlockPage;
