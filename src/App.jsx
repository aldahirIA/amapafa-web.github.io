import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut 
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { 
    getStorage, 
    ref, 
    uploadBytesResumable, 
    getDownloadURL 
} from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, LogOut, UserPlus, Search, X, LoaderCircle, FileText, Building, FileInput, FolderKanban, Users, Handshake, FileCheck2, FileArchive } from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE ---
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCIraEsvAfGw9-3xXq8atz0lJLvD61a8ng",
  authDomain: "amapafa-gestor-de-documentos.firebaseapp.com",
  projectId: "amapafa-gestor-de-documentos",
  storageBucket: "amapafa-gestor-de-documentos.firebasestorage.app",
  messagingSenderId: "118355159835",
  appId: "1:118355159835:web:fc5c5bd7855e812aad41be",
  measurementId: "G-XWRT1GNWH8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// --- INICIALIZACIÓN DE SERVICIOS ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- CONSTANTES Y CONFIGURACIÓN ---
const ADMIN_EMAIL = "aldahirinfante66@gmail.com";
const ADMIN_USERNAME = "aldahirIA";
const CATEGORIAS = [
    { id: 'oficios', nombre: 'Oficios', icon: FileInput },
    { id: 'solicitudes', nombre: 'Solicitudes', icon: FileText },
    { id: 'informes_anuales', nombre: 'Informes Anuales', icon: FolderKanban },
    { id: 'resoluciones', nombre: 'Resoluciones Ejecutivas Internas', icon: FileCheck2 },
    { id: 'wasi_mikuna', nombre: 'Doc. Recibidos por Wasi Mikuna', icon: Building },
    { id: 'pronied', nombre: 'Doc. Recibidos por PRONIED', icon: Building },
    { id: 'des', nombre: 'Doc. Recibidos por Dir. Edu. Secundaria', icon: Users },
    { id: 'acuerdos_contratos', nombre: 'Acuerdos y Contratos', icon: Handshake },
    { id: 'otros', nombre: 'Otros', icon: FileArchive },
];

// --- COMPONENTES DE LA INTERFAZ ---

// Componente para íconos de categorías
const CategoryIcon = ({ categoryId }) => {
    const category = CATEGORIAS.find(c => c.id === categoryId);
    const Icon = category ? category.icon : FileArchive;
    return <Icon className="w-5 h-5 text-gray-500" />;
};

// Animaciones reusables con Framer Motion
const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
};

const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
};

// Componente de Login
const LoginPage = ({ setUser, setIsAdmin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            if (userCredential.user.email === ADMIN_EMAIL) {
                setIsAdmin(true);
            }
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                setError('Correo electrónico o contraseña incorrectos.');
            } else {
                setError('Ocurrió un error. Inténtalo de nuevo.');
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white text-black">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg border border-gray-200 shadow-2xl shadow-gray-300/20"
            >
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tighter">Gestor Documental</h1>
                    <p className="text-gray-500 mt-2">Inicia sesión para continuar</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Correo Electrónico"
                            required
                            className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-md focus:outline-none focus:border-black transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Contraseña"
                            required
                            className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-md focus:outline-none focus:border-black transition-colors"
                        />
                    </div>
                    {error && <p className="text-sm text-center text-red-500">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 font-semibold text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 ease-in-out flex items-center justify-center disabled:bg-gray-500"
                    >
                        {isLoading ? <LoaderCircle className="animate-spin" /> : 'Ingresar'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

// Componente del Panel de Administración
const AdminPanel = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setIsError(false);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setMessage(`Usuario ${email} registrado exitosamente.`);
            setEmail('');
            setPassword('');
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setMessage('Este correo electrónico ya está en uso.');
            } else if (error.code === 'auth/weak-password') {
                setMessage('La contraseña debe tener al menos 6 caracteres.');
            } else {
                setMessage('Error al registrar el usuario.');
            }
            setIsError(true);
        }
        setIsLoading(false);
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={pageTransition}
            className="p-8 bg-white rounded-lg shadow-md border border-gray-100"
        >
            <h2 className="text-2xl font-bold mb-6 flex items-center"><UserPlus className="mr-3" /> Registrar Nuevo Usuario</h2>
            <form onSubmit={handleRegister} className="space-y-4">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo del nuevo usuario"
                    required
                    className="w-full px-4 py-2 bg-gray-100 border-gray-200 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña para el nuevo usuario"
                    required
                    className="w-full px-4 py-2 bg-gray-100 border-gray-200 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 font-semibold text-white bg-black rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center disabled:bg-gray-600"
                >
                    {isLoading ? <LoaderCircle className="animate-spin" /> : 'Registrar Usuario'}
                </button>
            </form>
            {message && (
                <p className={`mt-4 text-sm text-center ${isError ? 'text-red-500' : 'text-green-600'}`}>
                    {message}
                </p>
            )}
        </motion.div>
    );
};

// Componente para subir archivos
const UploadModal = ({ setShowModal, user }) => {
    const [file, setFile] = useState(null);
    const [category, setCategory] = useState(CATEGORIAS[0].id);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const generateCode = (cat) => {
        const prefix = cat.substring(0, 3).toUpperCase();
        const timestamp = Date.now();
        return `${prefix}-${timestamp}`;
    };

    const handleUpload = async () => {
        if (!file || !category) {
            setError('Por favor, selecciona un archivo y una categoría.');
            return;
        }
        setError('');
        setUploading(true);

        const docCode = generateCode(category);
        const storageRef = ref(storage, `documentos/${docCode}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgress(prog);
            },
            (error) => {
                console.error("Error en subida:", error);
                setError('Error al subir el archivo.');
                setUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                await addDoc(collection(db, 'documentos'), {
                    codigo: docCode,
                    nombreArchivo: file.name,
                    url: downloadURL,
                    categoria: category,
                    subidoPor: user.email,
                    fechaCreacion: serverTimestamp()
                });
                setUploading(false);
                setShowModal(false);
            }
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={() => !uploading && setShowModal(false)}
        >
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8 space-y-6"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-gray-900">Subir Nuevo Documento</h2>
                
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        {CATEGORIAS.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-700 focus-within:outline-none">
                                    <span>Selecciona un archivo</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                </label>
                            </div>
                            {file ? <p className="text-sm text-gray-500">{file.name}</p> : <p className="text-xs text-gray-500">PDF, DOCX, PNG, JPG, etc.</p>}
                        </div>
                    </div>
                </div>

                {uploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-black h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        <p className="text-center text-sm mt-1">{progress}%</p>
                    </div>
                )}

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-end space-x-4">
                    <button
                        onClick={() => setShowModal(false)}
                        disabled={uploading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 flex items-center disabled:opacity-50 disabled:bg-gray-600"
                    >
                        {uploading ? <><LoaderCircle className="animate-spin mr-2" /> Subiendo...</> : 'Subir Documento'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Componente principal del Dashboard
const Dashboard = ({ user, isAdmin }) => {
    const [activeTab, setActiveTab] = useState('documents');
    const [showModal, setShowModal] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        const q = query(collection(db, 'documentos'), orderBy('fechaCreacion', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const docsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                fechaCreacion: doc.data().fechaCreacion?.toDate().toLocaleDateString('es-ES')
            }));
            setDocuments(docsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const matchesCategory = selectedCategory === 'all' || doc.categoria === selectedCategory;
            const matchesSearch = searchTerm === '' || doc.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || doc.nombreArchivo.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [documents, searchTerm, selectedCategory]);

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AnimatePresence>
                {showModal && <UploadModal setShowModal={setShowModal} user={user} />}
            </AnimatePresence>
            
            <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-bold tracking-tighter">AMAPAFA Gestor</h1>
                            <div className="hidden md:flex items-center space-x-1 text-sm text-gray-500">
                                <span>|</span>
                                <span>Bienvenido, {isAdmin ? ADMIN_USERNAME : user.email}</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={() => setShowModal(true)} className="hidden sm:flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors">
                                <FileUp className="w-4 h-4 mr-2" />
                                Subir Documento
                            </button>
                            <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                <LogOut className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                    {isAdmin && (
                        <nav className="flex space-x-4 border-t border-gray-200 -mb-px">
                            <button onClick={() => setActiveTab('documents')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'documents' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Gestor de Documentos
                            </button>
                            <button onClick={() => setActiveTab('admin')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'admin' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Panel de Administrador
                            </button>
                        </nav>
                    )}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'documents' && (
                        <motion.div key="documents" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
                            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="md:col-span-2 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar por código o nombre de archivo..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                    </div>
                                    <div>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white"
                                        >
                                            <option value="all">Todas las categorías</option>
                                            {CATEGORIAS.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="overflow-x-auto">
                                    {loading ? (
                                        <div className="flex justify-center items-center h-64">
                                            <LoaderCircle className="w-8 h-8 animate-spin text-gray-500" />
                                        </div>
                                    ) : (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Archivo</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                <AnimatePresence>
                                                {filteredDocuments.length > 0 ? filteredDocuments.map((doc) => (
                                                    <motion.tr 
                                                        key={doc.id}
                                                        layout
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{doc.codigo}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-black hover:underline">
                                                                {doc.nombreArchivo}
                                                            </a>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <div className="flex items-center">
                                                                <CategoryIcon categoryId={doc.categoria} />
                                                                <span className="ml-2">{CATEGORIAS.find(c => c.id === doc.categoria)?.nombre || 'Desconocida'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.fechaCreacion}</td>
                                                    </motion.tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-10 text-gray-500">No se encontraron documentos.</td>
                                                    </tr>
                                                )}
                                                </AnimatePresence>
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'admin' && isAdmin && (
                        <motion.div key="admin" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
                            <AdminPanel />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            
            <button
                onClick={() => setShowModal(true)}
                className="sm:hidden fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-transform transform hover:scale-110"
            >
                <FileUp className="w-6 h-6" />
            </button>
        </div>
    );
};

// Componente Raíz de la Aplicación
export default function App() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                if (currentUser.email === ADMIN_EMAIL) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        // Limpieza al desmontar el componente
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <LoaderCircle className="w-12 h-12 animate-spin text-black" />
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            {user ? (
                <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Dashboard user={user} isAdmin={isAdmin} />
                </motion.div>
            ) : (
                <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <LoginPage setUser={setUser} setIsAdmin={setIsAdmin} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}