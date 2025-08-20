import React, { useState } from 'react';
import type { Attachment, AttachmentFile, AttachmentVideo } from '../types';
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';
import { PaperClipIcon, VideoCameraIcon, TrashIcon } from './icons';

interface GeneratorAttachmentsProps {
    attachments: Attachment[];
    setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
}

const AttachmentEditor: React.FC<{
    attachment: Attachment;
    onChange: (updatedAttachment: Attachment) => void;
    onRemove: () => void;
}> = ({ attachment, onChange, onRemove }) => {
    
    return (
        <div className="p-4 border border-slate-300 rounded-lg space-y-3 bg-white">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    {attachment.type === 'file' 
                        ? <PaperClipIcon className="w-5 h-5 text-slate-500" /> 
                        : <VideoCameraIcon className="w-5 h-5 text-slate-500" />}
                    <span className="font-semibold text-slate-700">
                        {attachment.type === 'file' ? 'Archivo Adjunto' : 'Video Adjunto'}
                    </span>
                </div>
                <button type="button" onClick={onRemove} title="Eliminar adjunto" className="p-1 text-red-500 hover:text-red-700">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
            
            <Input 
                id={`att-title-${attachment.type}`}
                label="Título"
                value={attachment.title}
                onChange={(e) => onChange({...attachment, title: e.target.value })}
            />
             <Textarea
                id={`att-desc-${attachment.type}`}
                label="Descripción"
                value={attachment.description}
                onChange={(e) => onChange({...attachment, description: e.target.value })}
                rows={2}
            />
            {attachment.type === 'file' ? (
                <Input 
                    id="att-file"
                    label="Nombre del Archivo (simulado)"
                    value={(attachment as AttachmentFile).fileName}
                    onChange={(e) => onChange({...attachment, fileName: e.target.value })}
                    // In a real app, this would be a file upload input.
                />
            ) : (
                <Input 
                    id="att-video"
                    label="Enlace de YouTube"
                    value={(attachment as AttachmentVideo).youtubeUrl}
                    onChange={(e) => onChange({...attachment, youtubeUrl: e.target.value })}
                />
            )}
        </div>
    )
}


const GeneratorAttachments: React.FC<GeneratorAttachmentsProps> = ({ attachments, setAttachments }) => {

    const addAttachment = (type: 'file' | 'video') => {
        if(type === 'file') {
            const newFile: AttachmentFile = { type: 'file', title: '', description: '', fileName: '' };
            setAttachments(prev => [...prev, newFile]);
        } else {
            const newVideo: AttachmentVideo = { type: 'video', title: '', description: '', youtubeUrl: ''};
            setAttachments(prev => [...prev, newVideo]);
        }
    }
    
    const updateAttachment = (index: number, updatedAttachment: Attachment) => {
        setAttachments(prev => prev.map((att, i) => i === index ? updatedAttachment : att));
    }

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Contenido Adicional al Finalizar</h3>
            <p className="text-sm text-slate-600">Añade recursos que los estudiantes verán solo después de completar y aprobar el curso. (Archivos/videos no se suben en esta demo).</p>
            
            <div className="space-y-4">
                {attachments.map((att, index) => (
                    <AttachmentEditor 
                        key={index}
                        attachment={att}
                        onChange={(updated) => updateAttachment(index, updated)}
                        onRemove={() => removeAttachment(index)}
                    />
                ))}
            </div>

            <div className="flex items-center gap-4">
                <Button type="button" onClick={() => addAttachment('file')} className="!bg-sky-600 hover:!bg-sky-700 text-sm !py-2">
                    <PaperClipIcon className="w-4 h-4 mr-2"/> Añadir Archivo
                </Button>
                <Button type="button" onClick={() => addAttachment('video')} className="!bg-rose-600 hover:!bg-rose-700 text-sm !py-2">
                    <VideoCameraIcon className="w-4 h-4 mr-2"/> Añadir Video
                </Button>
            </div>
        </div>
    );
};

export default GeneratorAttachments;