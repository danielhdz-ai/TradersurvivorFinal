// ===================================================
// CORRECCIÓN COMPLETA DEL SISTEMA DE IMPORTACIÓN CSV
// ===================================================

// 1. FUNCIÓN MEJORADA PARA ELIMINAR DUPLICADOS
function removeDuplicateOperations() {
    console.log('🧹 Iniciando eliminación de operaciones duplicadas...');
    
    // Crear un mapa para identificar duplicados
    const operationsMap = new Map();
    const duplicates = [];
    
    DB.operations.forEach((op, index) => {
        // Crear clave única basada en múltiples campos
        const key = `${op.date}-${op.instrument}-${op.type}-${op.entry}-${op.exit}-${op.volume}-${op.accountId}`;
        
        if (operationsMap.has(key)) {
            // Es un duplicado
            const originalOp = operationsMap.get(key);
            duplicates.push({
                original: originalOp,
                duplicate: op,
                originalIndex: operationsMap.get(key + '_index'),
                duplicateIndex: index
            });
        } else {
            operationsMap.set(key, op);
            operationsMap.set(key + '_index', index);
        }
    });
    
    if (duplicates.length === 0) {
        console.log('✅ No se encontraron operaciones duplicadas');
        return { removed: 0, kept: DB.operations.length };
    }
    
    console.log(`❌ Encontrados ${duplicates.length} duplicados:`);
    
    // Mostrar detalles de los duplicados
    duplicates.forEach((dup, i) => {
        console.log(`${i + 1}. Original: ${dup.original.id} | Duplicado: ${dup.duplicate.id}`);
        console.log(`   ${dup.original.date} ${dup.original.instrument} ${dup.original.type} P&L: ${dup.original.pl}`);
    });
    
    // Confirmar eliminación con el usuario
    const confirmRemoval = confirm(
        `Se encontraron ${duplicates.length} operaciones duplicadas.\n\n` +
        `¿Deseas eliminar los duplicados?\n\n` +
        `Se mantendrán las operaciones originales y se eliminarán las copias.`
    );
    
    if (!confirmRemoval) {
        console.log('❌ Eliminación de duplicados cancelada por el usuario');
        return { removed: 0, kept: DB.operations.length };
    }
    
    // Eliminar duplicados (de atrás hacia adelante para no afectar índices)
    const indicesToRemove = duplicates.map(dup => dup.duplicateIndex).sort((a, b) => b - a);
    const removedOps = [];
    
    indicesToRemove.forEach(index => {
        removedOps.push(DB.operations[index]);
        DB.operations.splice(index, 1);
    });
    
    console.log(`✅ Se eliminaron ${removedOps.length} operaciones duplicadas`);
    
    return { 
        removed: removedOps.length, 
        kept: DB.operations.length,
        removedOperations: removedOps
    };
}

// 2. FUNCIÓN MEJORADA PARA PROCESAR CSV GENERAL (parsea correctamente)
function parseCSVFixed(csvText) {
    const lines = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    if (lines.length === 0) return { headers: [], rows: [] };

    const splitLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result.map(v => v.replace(/^"|"$/g, ''));
    };

    // Normalizar headers (convertir a minúsculas y quitar espacios extra)
    const rawHeaders = splitLine(lines[0]);
    const headers = rawHeaders.map(h => h.toLowerCase().trim().replace(/\s+/g, ' '));
    
    console.log('📋 Headers detectados:', headers);
    
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") continue;
        
        const values = splitLine(line);
        if (values.length >= headers.length) {
            // Crear objeto con headers normalizados
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            rows.push(row);
        } else {
            console.warn(`Línea ${i} omitida: ${values.length} columnas vs ${headers.length} esperadas`);
        }
    }
    
    return { headers, rows: rows };
}

// 3. FUNCIÓN CORREGIDA PARA PROCESAR CSV RESPETANDO AGRUPACIÓN
async function processCSVFileFixed(file, statusDiv) {
    console.log('📄 Procesando archivo CSV corregido...');
    showLoading(true);
    
    const csvText = await file.text();
    const parsedData = parseCSVFixed(csvText);

    if (!parsedData.headers || parsedData.rows.length === 0) {
        throw new Error("CSV vacío o formato de cabecera incorrecto.");
    }

    // Verificar headers requeridos
    const requiredHeaders = ['nombre cuenta', 'fecha', 'instrumento', 'tipo', 'volumen', 'divisa'];
    const missingHeaders = requiredHeaders.filter(req => !parsedData.headers.includes(req));
    
    if (missingHeaders.length > 0) {
        throw new Error(`Headers requeridos faltantes: ${missingHeaders.join(', ')}`);
    }

    let importedOpsCount = 0;
    let skippedOpsCount = 0;
    let updatedOpsCount = 0;
    
    // Usar Map para agrupar por ID (si existe) o crear operaciones individuales
    const operationsMap = new Map();
    const existingIds = new Set(DB.operations.map(op => op.id));

    for (const row of parsedData.rows) {
        try {
            // Validar cuenta
            const accountNameFromCsv = row['nombre cuenta'];
            if (!accountNameFromCsv || accountNameFromCsv.trim() === "") {
                skippedOpsCount++;
                continue;
            }

            const account = DB.accounts.find(acc => 
                acc.name.trim().toLowerCase() === accountNameFromCsv.trim().toLowerCase()
            );
            
            if (!account) {
                console.warn(`Cuenta no encontrada: "${accountNameFromCsv}". Operación omitida.`);
                skippedOpsCount++;
                continue;
            }

            // Procesar fecha
            const dateStr = row['fecha'];
            const cleanDateStr = dateStr.trim();
            let opDate;

            if (cleanDateStr.includes('-')) {
                const parts = cleanDateStr.split('-');
                if (parts.length === 3 && parts[0].length === 4) {
                    opDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                }
            } else if (cleanDateStr.includes('/')) {
                const parts = cleanDateStr.split('/');
                if (parts.length === 3) {
                    const day = parts[0].padStart(2, '0');
                    const month = parts[1].padStart(2, '0');
                    const year = parts[2];
                    opDate = `${year}-${month}-${day}`;
                }
            }

            if (!opDate) {
                console.warn(`Fecha inválida: "${dateStr}". Operación omitida.`);
                skippedOpsCount++;
                continue;
            }

            // Extraer datos básicos
            const instrument = row['instrumento'].toUpperCase().trim();
            const type = row['tipo'].toLowerCase().trim();
            const entryTime = row['hora entrada'] || null;
            const exitTime = row['hora salida'] || null;
            const entry = parseFloat(String(row['entrada'] || '0').replace(',', '.'));
            const exit = parseFloat(String(row['salida'] || '0').replace(',', '.'));
            const volume = parseFloat(String(row['volumen'] || '0').replace(',', '.'));
            const currency = row['divisa'].toUpperCase().trim();
            const notes = row['notas'] || '';
            const fees = parseFloat(String(row['tarifa/comision'] || '0').replace(',', '.')) || 0;

            // Calcular P&L
            let pl = 0;
            if (row['p&l'] && String(row['p&l']).trim() !== "") {
                pl = parseFloat(String(row['p&l']).replace(',', '.'));
            } else if (!isNaN(entry) && !isNaN(exit) && volume > 0) {
                pl = type === 'buy' ? (exit - entry) * volume : (entry - exit) * volume;
            }

            // Determinar ID de operación
            let operationId;
            if (row['id'] && String(row['id']).trim() !== "") {
                operationId = String(row['id']).trim();
            } else {
                // Generar ID único basado en datos de la operación
                operationId = `${account.id}_${opDate}_${instrument}_${type}_${entry}_${volume}`.replace(/[^a-zA-Z0-9_]/g, '');
            }

            // Verificar si es un duplicado exacto
            const duplicateKey = `${opDate}-${instrument}-${type}-${entry}-${exit}-${volume}-${account.id}`;
            const isDuplicate = DB.operations.some(existingOp => {
                const existingKey = `${existingOp.date}-${existingOp.instrument}-${existingOp.type}-${existingOp.entry}-${existingOp.exit}-${existingOp.volume}-${existingOp.accountId}`;
                return existingKey === duplicateKey;
            });

            if (isDuplicate) {
                console.log(`⏭️ Operación duplicada omitida: ${instrument} ${type} ${opDate}`);
                skippedOpsCount++;
                continue;
            }

            // Gestionar agrupación por ID
            if (operationsMap.has(operationId)) {
                // Agrupar parciales
                const existingOp = operationsMap.get(operationId);
                existingOp.pl += pl;
                existingOp.volume += volume;
                existingOp.fees += fees;
                existingOp.exitTime = exitTime || existingOp.exitTime;
                existingOp.exit = !isNaN(exit) ? exit : existingOp.exit;
                existingOp.notes = [existingOp.notes, notes].filter(Boolean).join('; ');
                
                // Añadir a parciales
                if (!existingOp.partials) {
                    existingOp.partials = [];
                }
                existingOp.partials.push({
                    entry: entry,
                    exit: exit,
                    volume: volume,
                    pl: pl,
                    entryTime: entryTime,
                    exitTime: exitTime,
                    fees: fees
                });
                
                updatedOpsCount++;
            } else {
                // Crear nueva operación
                const operation = {
                    id: operationId,
                    date: opDate,
                    accountId: account.id,
                    instrument: instrument,
                    type: type,
                    entry: isNaN(entry) ? null : entry,
                    exit: isNaN(exit) ? null : exit,
                    entryTime: entryTime,
                    exitTime: exitTime,
                    volume: volume,
                    pl: pl,
                    currency: currency,
                    notes: notes,
                    fees: fees,
                    result: pl > 0 ? 'win' : (pl < 0 ? 'loss' : 'breakeven'),
                    imageDatas: [],
                    manualPL: row['p&l'] ? pl : null,
                    session: getTradingSession(entryTime) || 'No especificado'
                };

                operationsMap.set(operationId, operation);
                importedOpsCount++;
            }

        } catch (error) {
            console.error('Error procesando fila CSV:', error);
            skippedOpsCount++;
        }
    }

    // Convertir Map a array y actualizar resultados finales
    const newOperations = Array.from(operationsMap.values());
    newOperations.forEach(op => {
        op.result = op.pl > 0 ? 'win' : (op.pl < 0 ? 'loss' : 'breakeven');
        
        // Marcar si tiene parciales
        if (op.partials && op.partials.length > 0) {
            op.isGrouped = true;
        }
    });

    // Guardar en base de datos
    if (newOperations.length > 0) {
        try {
            // Usar bulkPut para permitir actualizaciones
            await dexieDB.operations.bulkPut(newOperations);

            // Actualizar array en memoria
            newOperations.forEach(newOp => {
                const existingOpIndex = DB.operations.findIndex(op => op.id === newOp.id);
                if (existingOpIndex !== -1) {
                    DB.operations[existingOpIndex] = newOp;
                } else {
                    DB.operations.push(newOp);
                }
            });

            // Sincronizar con Supabase si el usuario está autenticado
            if (currentUser) {
                console.log('🔄 Sincronizando con Supabase...');
                for (const operation of newOperations) {
                    try {
                        await saveOperationToSupabase(operation);
                    } catch (error) {
                        console.error('Error sincronizando con Supabase:', error);
                        // Agregar a cola de sincronización si existe la función
                        if (typeof addToSyncQueue === 'function') {
                            addToSyncQueue(operation, 'operation');
                        }
                    }
                }
            }

            updateAccountBalances();
            refreshAllViews();

            const message = `✅ Importación completada:\n` +
                          `• ${importedOpsCount} operaciones nuevas\n` +
                          `• ${updatedOpsCount} operaciones agrupadas\n` +
                          `• ${skippedOpsCount} filas omitidas`;
            
            if (statusDiv) {
                statusDiv.textContent = message.replace(/\n/g, ' ');
                statusDiv.className = 'mt-2 text-sm text-positive';
            }
            
            console.log(message);

        } catch (error) {
            console.error('Error guardando operaciones:', error);
            throw new Error('Error al guardar operaciones en la base de datos');
        }
    } else {
        const message = `❌ No se importaron operaciones. ${skippedOpsCount} filas omitidas.`;
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = 'mt-2 text-sm text-negative';
        }
        console.log(message);
    }

    showLoading(false);
}

// 4. FUNCIÓN PARA DETECTAR Y CORREGIR OPERACIONES PARCIALES EXISTENTES
async function fixExistingPartialOperations() {
    console.log('🔧 Analizando operaciones existentes para detectar parciales...');
    
    // Agrupar operaciones por fecha, instrumento, tipo y cuenta
    const groupsMap = new Map();
    
    DB.operations.forEach(op => {
        const groupKey = `${op.date}_${op.instrument}_${op.type}_${op.accountId}`;
        if (!groupsMap.has(groupKey)) {
            groupsMap.set(groupKey, []);
        }
        groupsMap.get(groupKey).push(op);
    });
    
    let groupedCount = 0;
    let operationsToRemove = [];
    let operationsToAdd = [];
    
    for (const [groupKey, operations] of groupsMap) {
        if (operations.length > 1) {
            console.log(`📊 Grupo encontrado: ${groupKey} con ${operations.length} operaciones`);
            
            // Verificar si son realmente parciales (precios similares, misma dirección)
            const avgEntry = operations.reduce((sum, op) => sum + (op.entry || 0), 0) / operations.length;
            const entryVariance = operations.every(op => Math.abs((op.entry || 0) - avgEntry) < avgEntry * 0.05); // 5% tolerancia
            
            if (entryVariance) {
                // Crear operación agrupada
                const groupedOp = {
                    id: `grouped_${Date.now()}_${groupedCount}`,
                    date: operations[0].date,
                    accountId: operations[0].accountId,
                    instrument: operations[0].instrument,
                    type: operations[0].type,
                    entry: avgEntry,
                    exit: operations.reduce((sum, op) => sum + (op.exit || 0), 0) / operations.length,
                    entryTime: operations[0].entryTime,
                    exitTime: operations[operations.length - 1].exitTime,
                    volume: operations.reduce((sum, op) => sum + (op.volume || 0), 0),
                    pl: operations.reduce((sum, op) => sum + (op.pl || 0), 0),
                    currency: operations[0].currency,
                    notes: `Agrupado de ${operations.length} parciales: ${operations.map(op => op.id).join(', ')}`,
                    fees: operations.reduce((sum, op) => sum + (op.fees || 0), 0),
                    result: '', // Se calculará después
                    imageDatas: [],
                    manualPL: null,
                    session: operations[0].session || 'No especificado',
                    isGrouped: true,
                    partials: operations.map(op => ({
                        id: op.id,
                        entry: op.entry,
                        exit: op.exit,
                        volume: op.volume,
                        pl: op.pl,
                        entryTime: op.entryTime,
                        exitTime: op.exitTime,
                        fees: op.fees,
                        type: op.type,
                        instrument: op.instrument,
                        currency: op.currency
                    }))
                };
                
                groupedOp.result = groupedOp.pl > 0 ? 'win' : (groupedOp.pl < 0 ? 'loss' : 'breakeven');
                
                // Marcar operaciones originales para eliminación
                operations.forEach(op => operationsToRemove.push(op.id));
                operationsToAdd.push(groupedOp);
                groupedCount++;
            }
        }
    }
    
    if (groupedCount === 0) {
        console.log('✅ No se encontraron parciales para agrupar');
        return { grouped: 0, removed: 0 };
    }
    
    const confirmGrouping = confirm(
        `Se encontraron ${groupedCount} grupos de operaciones parciales (${operationsToRemove.length} operaciones individuales).\n\n` +
        `¿Deseas agruparlas? Esto simplificará tu vista de operaciones.`
    );
    
    if (!confirmGrouping) {
        console.log('❌ Agrupación cancelada por el usuario');
        return { grouped: 0, removed: 0 };
    }
    
    try {
        // Eliminar operaciones originales
        await dexieDB.operations.bulkDelete(operationsToRemove);
        DB.operations = DB.operations.filter(op => !operationsToRemove.includes(op.id));
        
        // Agregar operaciones agrupadas
        await dexieDB.operations.bulkAdd(operationsToAdd);
        DB.operations.push(...operationsToAdd);
        
        // Sincronizar con Supabase si corresponde
        if (currentUser) {
            for (const op of operationsToAdd) {
                try {
                    await saveOperationToSupabase(op);
                } catch (error) {
                    console.error('Error sincronizando operación agrupada:', error);
                }
            }
            
            for (const opId of operationsToRemove) {
                try {
                    await deleteOperationFromSupabase(opId);
                } catch (error) {
                    console.error('Error eliminando operación original:', error);
                }
            }
        }
        
        updateAccountBalances();
        refreshAllViews();
        
        console.log(`✅ Se agruparon ${groupedCount} conjuntos de parciales, eliminando ${operationsToRemove.length} operaciones individuales`);
        
        return { grouped: groupedCount, removed: operationsToRemove.length };
        
    } catch (error) {
        console.error('Error durante agrupación:', error);
        throw new Error('Error al agrupar operaciones parciales');
    }
}

// 5. FUNCIÓN PRINCIPAL DE CORRECCIÓN COMPLETA
async function fixAllCSVImportIssues() {
    console.log('🚀 Iniciando corrección completa del sistema de importación CSV...');
    
    const results = {
        duplicatesRemoved: 0,
        partialsGrouped: 0,
        operationsProcessed: 0
    };
    
    try {
        // Paso 1: Eliminar duplicados
        console.log('\n📍 Paso 1: Eliminando duplicados...');
        const duplicateResults = removeDuplicateOperations();
        results.duplicatesRemoved = duplicateResults.removed;
        
        // Paso 2: Corregir agrupación de parciales
        console.log('\n📍 Paso 2: Agrupando operaciones parciales...');
        const groupingResults = await fixExistingPartialOperations();
        results.partialsGrouped = groupingResults.grouped;
        
        // Paso 3: Actualizar vistas
        console.log('\n📍 Paso 3: Actualizando interfaz...');
        updateAccountBalances();
        refreshAllViews();
        
        results.operationsProcessed = DB.operations.length;
        
        const successMessage = `✅ Corrección completada exitosamente:\n\n` +
                             `• ${results.duplicatesRemoved} duplicados eliminados\n` +
                             `• ${results.partialsGrouped} grupos de parciales creados\n` +
                             `• ${results.operationsProcessed} operaciones totales en el sistema\n\n` +
                             `El sistema de importación CSV está ahora optimizado.`;
        
        console.log(successMessage);
        alert(successMessage);
        
        return results;
        
    } catch (error) {
        console.error('❌ Error durante la corrección:', error);
        alert(`Error durante la corrección: ${error.message}`);
        throw error;
    }
}

// 6. FUNCIÓN AUXILIAR PARA DETECTAR SESIÓN DE TRADING
function getTradingSession(entryTimeStr) {
    if (!entryTimeStr) return 'No especificado';

    const [hoursStr] = entryTimeStr.split(':');
    const entryHourUTC = parseInt(hoursStr, 10);

    if (entryHourUTC >= 22 || entryHourUTC < 7) {
        return 'Asia';
    } else if (entryHourUTC >= 7 && entryHourUTC < 12) {
        return 'Londres';
    } else if (entryHourUTC >= 12 && entryHourUTC < 17) {
        return 'Nueva York (solapamiento Londres)';
    } else if (entryHourUTC >= 17 && entryHourUTC < 21) {
        return 'Nueva York';
    }
    return 'Fuera de Sesión Principal / Otro';
}

// 7. REEMPLAZAR FUNCIÓN parseCSV ORIGINAL
if (typeof window !== 'undefined') {
    window.parseCSVOriginal = window.parseCSV;
    window.parseCSV = parseCSVFixed;
    window.processCSVFileOriginal = window.processCSVFile;
    window.processCSVFile = processCSVFileFixed;
    
    // Hacer funciones disponibles globalmente para pruebas
    window.removeDuplicateOperations = removeDuplicateOperations;
    window.fixExistingPartialOperations = fixExistingPartialOperations;
    window.fixAllCSVImportIssues = fixAllCSVImportIssues;
    
    console.log('🔧 Funciones de corrección CSV instaladas globalmente');
    console.log('📖 Usa window.fixAllCSVImportIssues() para ejecutar la corrección completa');
}

// ===================================================
// INSTRUCCIONES DE USO:
// ===================================================
/*
1. Abre la consola del navegador (F12)
2. Ejecuta: fixAllCSVImportIssues()
3. Sigue las instrucciones en pantalla
4. El sistema corregirá automáticamente:
   - Operaciones duplicadas
   - Agrupación incorrecta de parciales
   - Problemas de importación CSV

Para usar individualmente:
- removeDuplicateOperations() - Solo elimina duplicados
- fixExistingPartialOperations() - Solo agrupa parciales
- parseCSVFixed(csvText) - Parser CSV mejorado
*/