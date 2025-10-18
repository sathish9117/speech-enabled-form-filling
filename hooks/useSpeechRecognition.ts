
import { useState, useEffect, useRef } from 'react';

// FIX: Add type definitions for the Web Speech API to resolve TypeScript errors.
// These interfaces provide type safety for the non-standard SpeechRecognition browser API.
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onstart: () => void;
    onend: () => void;
    onerror: (event: SpeechRecognitionError) => void;
    onresult: (event: SpeechRecognitionEvent) => void;
}

interface SpeechRecognitionError extends Event {
    error: string;
}

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList extends ArrayLike<SpeechRecognitionResult> {}

interface SpeechRecognitionResult extends ArrayLike<{ transcript: string }> {
    isFinal: boolean;
}

interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}


interface SpeechRecognitionHook {
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    error: string | null;
    browserSupportsSpeechRecognition: boolean;
}

const getSpeechRecognition = (): SpeechRecognitionStatic | null => {
    if (typeof window !== 'undefined') {
        return window.SpeechRecognition || window.webkitSpeechRecognition;
    }
    return null;
};

export const useSpeechRecognition = (): SpeechRecognitionHook => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = getSpeechRecognition();
        if (!SpeechRecognition) {
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            setError(event.error);
            setIsListening(false);
        };
        
        recognition.onresult = (event) => {
            const lastResult = event.results[event.results.length - 1];
            if (lastResult.isFinal) {
                setTranscript(lastResult[0].transcript);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        error,
        browserSupportsSpeechRecognition: !!getSpeechRecognition(),
    };
};
