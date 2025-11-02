import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, Trash2, Edit, Save } from 'lucide-react';
import { DemoSequence, DemoSequenceStep } from '../../lib/demo-sequences';
import { toast } from 'sonner';

interface SequenceEditorProps {
  sequence: DemoSequence;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (sequence: DemoSequence) => void;
}

export function SequenceEditor({ sequence, open, onOpenChange, onSave }: SequenceEditorProps) {
  const [editingSequence, setEditingSequence] = useState<DemoSequence>(sequence);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);

  const handleSaveSequence = () => {
    onSave(editingSequence);
    onOpenChange(false);
    toast.success('บันทึก Sequence สำเร็จ');
  };

  const handleUpdateStep = (index: number, updates: Partial<DemoSequenceStep>) => {
    const newSteps = [...editingSequence.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setEditingSequence({ ...editingSequence, steps: newSteps });
  };

  const handleDeleteStep = (index: number) => {
    if (window.confirm('ต้องการลบ step นี้?')) {
      const newSteps = editingSequence.steps.filter((_, i) => i !== index);
      setEditingSequence({ ...editingSequence, steps: newSteps });
      toast.success('ลบ step สำเร็จ');
    }
  };

  const handleAddMessage = (stepIndex: number) => {
    const newMessage = {
      sender: 'assistant' as const,
      text: 'ข้อความใหม่',
      cardType: 'info' as const,
      icon: '💬',
    };
    
    const newSteps = [...editingSequence.steps];
    newSteps[stepIndex].aiMessages = [...newSteps[stepIndex].aiMessages, newMessage];
    setEditingSequence({ ...editingSequence, steps: newSteps });
  };

  const handleUpdateMessage = (stepIndex: number, messageIndex: number, updates: any) => {
    const newSteps = [...editingSequence.steps];
    newSteps[stepIndex].aiMessages[messageIndex] = {
      ...newSteps[stepIndex].aiMessages[messageIndex],
      ...updates,
    };
    setEditingSequence({ ...editingSequence, steps: newSteps });
  };

  const handleDeleteMessage = (stepIndex: number, messageIndex: number) => {
    const newSteps = [...editingSequence.steps];
    newSteps[stepIndex].aiMessages = newSteps[stepIndex].aiMessages.filter(
      (_, i) => i !== messageIndex
    );
    setEditingSequence({ ...editingSequence, steps: newSteps });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">✏️ แก้ไข Demo Sequence</DialogTitle>
          <DialogDescription>
            แก้ไข steps, messages, และ settings ของ demo sequence
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Sequence Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ชื่อ Sequence</Label>
                  <Input
                    value={editingSequence.name}
                    onChange={(e) =>
                      setEditingSequence({ ...editingSequence, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>คำอธิบาย</Label>
                  <Input
                    value={editingSequence.description}
                    onChange={(e) =>
                      setEditingSequence({ ...editingSequence, description: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Steps List */}
          <div>
            <h3 className="font-semibold mb-2">Steps ({editingSequence.steps.length})</h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {editingSequence.steps.map((step, stepIndex) => (
                  <Card key={step.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge>{step.time}</Badge>
                          <h4 className="font-bold">{step.sceneName}</h4>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditingStepIndex(editingStepIndex === stepIndex ? null : stepIndex)
                            }
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteStep(stepIndex)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {editingStepIndex === stepIndex ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">เวลา</Label>
                              <Input
                                value={step.time}
                                onChange={(e) =>
                                  handleUpdateStep(stepIndex, { time: e.target.value })
                                }
                              />
                            </div>
                            <div className="col-span-2">
                              <Label className="text-xs">ชื่อฉาก</Label>
                              <Input
                                value={step.sceneName}
                                onChange={(e) =>
                                  handleUpdateStep(stepIndex, { sceneName: e.target.value })
                                }
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs">คำอธิบาย</Label>
                            <Textarea
                              value={step.description}
                              onChange={(e) =>
                                handleUpdateStep(stepIndex, { description: e.target.value })
                              }
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">ห้อง</Label>
                              <Input
                                value={step.room}
                                onChange={(e) =>
                                  handleUpdateStep(stepIndex, { room: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-xs">ระยะเวลา (วินาที)</Label>
                              <Input
                                type="number"
                                value={step.duration}
                                onChange={(e) =>
                                  handleUpdateStep(stepIndex, { duration: Number(e.target.value) })
                                }
                              />
                            </div>
                          </div>

                          {/* AI Messages */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-xs">AI Messages</Label>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddMessage(stepIndex)}
                                className="h-6"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                เพิ่ม
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {step.aiMessages.map((msg, msgIndex) => (
                                <div
                                  key={msgIndex}
                                  className="p-2 border rounded bg-gray-50 space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <select
                                      value={msg.sender}
                                      onChange={(e) =>
                                        handleUpdateMessage(stepIndex, msgIndex, {
                                          sender: e.target.value,
                                        })
                                      }
                                      className="text-xs p-1 border rounded"
                                    >
                                      <option value="user">User</option>
                                      <option value="assistant">Assistant</option>
                                    </select>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteMessage(stepIndex, msgIndex)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Trash2 className="h-3 w-3 text-red-500" />
                                    </Button>
                                  </div>
                                  <Input
                                    placeholder="Icon (emoji)"
                                    value={msg.icon || ''}
                                    onChange={(e) =>
                                      handleUpdateMessage(stepIndex, msgIndex, {
                                        icon: e.target.value,
                                      })
                                    }
                                    className="text-xs h-7"
                                  />
                                  <Textarea
                                    placeholder="ข้อความ"
                                    value={msg.text}
                                    onChange={(e) =>
                                      handleUpdateMessage(stepIndex, msgIndex, {
                                        text: e.target.value,
                                      })
                                    }
                                    rows={2}
                                    className="text-xs"
                                  />
                                  <select
                                    value={msg.cardType || 'info'}
                                    onChange={(e) =>
                                      handleUpdateMessage(stepIndex, msgIndex, {
                                        cardType: e.target.value,
                                      })
                                    }
                                    className="text-xs p-1 border rounded w-full"
                                  >
                                    <option value="hero">Hero Card</option>
                                    <option value="device">Device Card</option>
                                    <option value="alert">Alert Card</option>
                                    <option value="info">Info Card</option>
                                  </select>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">
                          <p>{step.description}</p>
                          <p className="mt-2">
                            📍 {step.room} • ⏱️ {step.duration}s • 💬 {step.aiMessages.length}{' '}
                            messages
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button className="flex-1 bg-[#0056B3]" onClick={handleSaveSequence}>
              <Save className="mr-2 h-4 w-4" />
              บันทึก Sequence
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

