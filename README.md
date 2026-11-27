# Il Mio Armadio

Guardaroba personale per fotografare i capi, creare un avatar e salvare outfit.
Foto e dati vengono salvati **solo sul dispositivo**, senza login, Firebase o Cloudinary.

## Avvio

Richiede Node.js 20.19+ o 22.12+ e npm.

```sh
npm ci
npm run dev
```

Apri http://localhost:3000. Su telefono la fotocamera richiede HTTPS.
Non servono chiavi API né variabili di ambiente.

## Memoria del telefono

Su Android l’app salva un file JSON nella cartella privata dell’app, senza database.
La versione web salva un file nello spazio privato del sito sul dispositivo (OPFS).
Se questa API non è disponibile usa localStorage, che ha una quota più limitata.
Le immagini vengono conservate come dati incorporati: nessun upload remoto.
Scritture concorrenti vengono serializzate e, sui browser che lo supportano,
protette anche tra schede tramite Web Locks. Gli errori di spazio vengono mostrati all’utente.

Il guardaroba resta disponibile dopo la chiusura del browser sullo stesso dispositivo,
browser e indirizzo del sito. La cancellazione dei dati del sito o la navigazione privata
possono eliminarlo. Nel Profilo puoi scaricare un backup JSON delle foto e dei dati.
I vecchi dati eventualmente presenti su Firebase non vengono trasferiti o cancellati.

La rimozione dello sfondo avviene sul dispositivo usando IMG.LY/ONNX: al primo utilizzo
scarica il modello da internet. Le immagini non vengono inviate al servizio.
Puoi disattivare la rimozione sfondo per salvare foto senza scaricare il modello.

## APK Android con GitHub Actions

Il workflow **Android APK** compila e verifica l’app a ogni push su `main` o `fix/**`,
nelle pull request e su avvio manuale. Apri la relativa esecuzione nella scheda Actions,
scarica l’artifact **Il-Mio-Armadio-Android**, estrai lo ZIP e installa `Il-Mio-Armadio.apk`.
Android potrebbe chiedere di consentire l’installazione dal browser o dal file manager.

Richiede Android 7 o successivo e Android System WebView aggiornato.
L’interfaccia è inclusa nell’APK: nessun server è necessario per aprire l’app.
Nell’app Android il backup si esporta tramite il menu di condivisione del telefono.
Disinstallando l’app o cancellandone i dati si perde l’archivio locale.

Tutti gli APK Android richiedono una firma: questo progetto usa una **chiave di debug
pubblica**, già inclusa in `android/debug.keystore`, senza segreti o configurazione richiesta.
Mantenerla invariata permette di aggiornare le build di sviluppo senza disinstallare.
È una distribuzione di sviluppo per installazione diretta, non una firma di produzione.
Il backup automatico Android è disabilitato per mantenere i dati sul dispositivo.

Per compilare con Android SDK e JDK 21 installati:

```sh
npm run android:sync
cd android
./gradlew assembleDebug
```

## Verifica

```sh
npm test
npm run typecheck
npm run build
```

I test verificano salvataggi locali, spazio esaurito, file OPFS, concorrenza e rilascio
della fotocamera anche quando il permesso arriva dopo la chiusura.
Fotocamera e rimozione sfondo vanno verificate anche sui dispositivi fisici di destinazione.
