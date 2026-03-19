import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
    if (!isOpen) return null;

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0 }
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    button: 'bg-red-500 hover:bg-red-600 shadow-red-100',
                    icon: 'text-red-500 bg-red-50',
                    border: 'border-red-100'
                };
            case 'success':
                return {
                    button: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100',
                    icon: 'text-emerald-500 bg-emerald-50',
                    border: 'border-emerald-100'
                };
            default:
                return {
                    button: 'bg-sky-500 hover:bg-sky-600 shadow-sky-100',
                    icon: 'text-sky-500 bg-sky-50',
                    border: 'border-sky-100'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Overlay */}
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white"
                    >
                        <div className="p-8">
                            <div className={`w-14 h-14 rounded-2xl ${styles.icon} flex items-center justify-center text-2xl mb-6 shadow-sm`}>
                                {type === 'danger' ? '⚠️' : type === 'success' ? '✅' : '❓'}
                            </div>

                            <h3 className="text-2xl font-black text-gray-900 leading-tight">
                                {title}
                            </h3>
                            <p className="mt-3 text-gray-600 font-medium leading-relaxed">
                                {message}
                            </p>

                            <div className="mt-8 flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3.5 rounded-2xl border-2 border-gray-100 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                                >
                                    {cancelText}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`flex-1 px-6 py-3.5 rounded-2xl text-white font-black shadow-lg transition-all ${styles.button}`}
                                >
                                    {confirmText}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
