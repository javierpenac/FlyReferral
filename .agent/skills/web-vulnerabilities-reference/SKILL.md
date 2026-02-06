---
name: Referencia de las 100 Principales Vulnerabilidades Web
description: Esta habilidad se utiliza para identificar vulnerabilidades en aplicaciones web, explicar fallos de seguridad comunes, comprender categorías de vulnerabilidades, aprender sobre ataques de inyección, revisar debilidades en el control de acceso, analizar problemas de seguridad en APIs y referenciar la taxonomía de vulnerabilidades alineada con OWASP. Proporciona definiciones exhaustivas, causas raíz, impactos y estrategias de mitigación.
metadata:
  author: zebbern
  version: "1.1"
---

# Referencia de las 100 Principales Vulnerabilidades Web

## Propósito

Proporcionar una referencia estructurada y exhaustiva para las 100 vulnerabilidades más críticas de aplicaciones web, organizadas por categoría. Esta habilidad permite la identificación sistemática de vulnerabilidades, la evaluación de impacto y la orientación para la remediación a través de todo el espectro de amenazas de seguridad web. El contenido está organizado en 15 categorías principales alineadas con los estándares de la industria y los patrones de ataque del mundo real.

## Prerrequisitos

- Comprensión básica de la arquitectura de aplicaciones web (modelo cliente-servidor, protocolo HTTP).
- Familiaridad con tecnologías web comunes (HTML, JavaScript, SQL, XML, APIs).
- Comprensión de conceptos de autenticación y autorización.
- Acceso a herramientas de pruebas de seguridad web (Burp Suite, OWASP ZAP).
- Conocimiento de principios de codificación segura recomendados.

## Resultados y Entregables

- Catálogo completo de vulnerabilidades con definiciones, causas raíz, impactos y mitigaciones.
- Agrupaciones de vulnerabilidades basadas en categorías para una evaluación sistemática.
- Referencia rápida para pruebas de seguridad y remediación.
- Base para listas de verificación de evaluación de vulnerabilidades y políticas de seguridad.

---

## Flujo de Trabajo Principal

### Fase 1: Evaluación de Vulnerabilidades de Inyección

Evaluar vectores de ataque de inyección dirigidos a componentes de procesamiento de datos:

**Inyección SQL (1)**
- Definición: Código SQL malicioso insertado en campos de entrada para manipular consultas a la base de datos.
- Causa Raíz: Falta de validación de entrada, uso inadecuado de consultas parametrizadas.
- Impacto: Acceso no autorizado a datos, manipulación de datos, compromiso de la base de datos.
- Mitigación: Usar consultas parametrizadas/sentencias preparadas, validación de entrada, cuentas de base de datos con privilegios mínimos.

**Cross-Site Scripting - XSS (2)**
- Definición: Inyección de scripts maliciosos en páginas web visualizadas por otros usuarios.
- Causa Raíz: Insuficiente codificación de salida, falta de sanitización de entrada.
- Impacto: Secuestro de sesión, robo de credenciales, desfiguración del sitio web.
- Mitigación: Codificación de salida, Política de Seguridad de Contenido (CSP), sanitización de entrada.

**Inyección de Comandos (5, 11)**
- Definición: Ejecución de comandos arbitrarios del sistema a través de aplicaciones vulnerables.
- Causa Raíz: Entrada de usuario no sanitizada pasada a shells del sistema.
- Impacto: Compromiso total del sistema, filtración de datos, movimiento lateral.
- Mitigación: Evitar la ejecución de shell, poner en lista blanca los comandos válidos, validación estricta de entrada.

**Inyección XML (6), Inyección LDAP (7), Inyección XPath (8)**
- Definición: Manipulación de consultas XML/LDAP/XPath mediante entrada maliciosa.
- Causa Raíz: Manejo inadecuado de la entrada en la construcción de consultas.
- Impacto: Exposición de datos, bypass de autenticación, divulgación de información.
- Mitigación: Validación de entrada, consultas parametrizadas, escapar caracteres especiales.

**Inyección de Plantillas del Lado del Servidor - SSTI (13)**
- Definición: Inyección de código malicioso en motores de plantillas.
- Causa Raíz: Entrada de usuario incrustada directamente en expresiones de plantilla.
- Impacto: Ejecución remota de código, compromiso del servidor.
- Mitigación: Motores de plantillas en sandbox, evitar entrada de usuario en plantillas, validación estricta de entrada.

### Fase 2: Seguridad de Autenticación y Sesión

Evaluar las debilidades del mecanismo de autenticación:

**Fijación de Sesión (14)**
- Definición: El atacante establece el ID de sesión de la víctima antes de la autenticación.
- Causa Raíz: El ID de sesión no se regenera después del inicio de sesión.
- Impacto: Secuestro de sesión, acceso no autorizado a cuentas.
- Mitigación: Regenerar el ID de sesión en la autenticación, usar una gestión de sesión segura.

**Ataque de Fuerza Bruta (15)**
- Definición: Adivinanza sistemática de contraseñas mediante herramientas automatizadas.
- Causa Raíz: Falta de bloqueo de cuenta, limitación de tasa o CAPTCHA.
- Impacto: Acceso no autorizado, compromiso de credenciales.
- Mitigación: Políticas de bloqueo de cuentas, limitación de tasa, MFA, CAPTCHA.

**Secuestro de Sesión (16)**
- Definición: El atacante roba o predice tokens de sesión válidos.
- Causa Raíz: Generación débil de tokens de sesión, transmisión insegura.
- Impacto: Toma de control de cuenta, acceso no autorizado.
- Mitigación: Generación segura de tokens aleatorios, HTTPS, flags de cookies HttpOnly/Secure.

**Credential Stuffing y Reutilización de Credenciales (22)**
- Definición: Uso de credenciales filtradas para acceder a cuentas en diferentes servicios.
- Causa Raíz: Usuarios que reutilizan contraseñas, falta de detección de brechas.
- Impacto: Compromiso masivo de cuentas, brechas de datos.
- Mitigación: MFA, comprobaciones de contraseñas en brechas, requisitos de credenciales únicas.

**Funcionalidad "Recordarme" Insegura (85)**
- Definición: Implementación débil de tokens de autenticación persistentes.
- Causa Raíz: Tokens predecibles, controles de expiración inadecuados.
- Impacto: Acceso persistente no autorizado, compromiso de sesión.
- Mitigación: Generación fuerte de tokens, expiración adecuada, almacenamiento seguro.

**Bypass de CAPTCHA (86)**
- Definición: Eludir los mecanismos de detección de bots.
- Causa Raíz: Algoritmos de CAPTCHA débiles, validación inadecuada.
- Impacto: Ataques automatizados, credential stuffing, spam.
- Mitigación: reCAPTCHA v3, detección de bots por capas, limitación de tasa.

### Fase 3: Exposición de Datos Sensibles

Identificar fallos en la protección de datos:

**IDOR - Referencias Directas Inseguras a Objetos (23, 42)**
- Definición: Acceso directo a objetos internos mediante referencias suministradas por el usuario.
- Causa Raíz: Falta de comprobaciones de autorización en el acceso a objetos.
- Impacto: Acceso no autorizado a datos, brechas de privacidad.
- Mitigación: Validación del control de acceso, mapas de referencia indirectos, comprobaciones de autorización.

**Fuga de Datos (24)**
- Definición: Divulgación inadvertida de información sensible.
- Causa Raíz: Protección de datos inadecuada, controles de acceso débiles.
- Impacto: Brechas de privacidad, penalizaciones regulatorias, daño a la reputación.
- Mitigación: Soluciones DLP, cifrado, controles de acceso, formación en seguridad.

**Almacenamiento de Datos No Cifrados (25)**
- Definición: Almacenamiento de datos sensibles sin cifrado.
- Causa Raíz: Fallo al implementar el cifrado en reposo.
- Impacto: Brechas de datos si el almacenamiento se ve comprometido.
- Mitigación: Cifrado de disco completo, cifrado de base de datos, gestión segura de claves.

**Divulgación de Información (33)**
- Definición: Exposición de detalles del sistema a través de mensajes de error o respuestas.
- Causa Raíz: Manejo de errores detallado, información de depuración en producción.
- Impacto: Reconocimiento para ataques posteriores, exposición de credenciales.
- Mitigación: Mensajes de error genéricos, desactivar el modo de depuración, registro seguro.

### Fase 4: Errores de Configuración de Seguridad

Evaluar debilidades de configuración:

**Falta de Encabezados de Seguridad (26)**
- Definición: Ausencia de encabezados HTTP protectores (CSP, X-Frame-Options, HSTS).
- Causa Raíz: Configuración de servidor inadecuada.
- Impacto: Ataques XSS, clickjacking, degradación del protocolo.
- Mitigación: Implementar CSP, X-Content-Type-Options, X-Frame-Options, HSTS.

**Contraseñas por Defecto (28)**
- Definición: Credenciales predeterminadas no cambiadas en sistemas/aplicaciones.
- Causa Raíz: Fallo al cambiar los valores predeterminados del proveedor.
- Impacto: Acceso no autorizado, compromiso del sistema.
- Mitigación: Cambios de contraseña obligatorios, políticas de contraseñas fuertes.

**Listado de Directorios (29)**
- Definición: El servidor web expone los contenidos del directorio.
- Causa Raíz: Configuración de servidor inadecuada.
- Impacto: Divulgación de información, exposición de archivos sensibles.
- Mitigación: Desactivar el indexado de directorios, usar archivos de índice predeterminados.

**Endpoints de API No Protegidos (30)**
- Definición: APIs que carecen de autenticación o autorización.
- Causa Raíz: Falta de controles de seguridad en las rutas de la API.
- Impacto: Acceso no autorizado a datos, abuso de la API.
- Mitigación: OAuth/claves de API, controles de acceso, limitación de tasa.

**Puertos y Servicios Abiertos (31)**
- Definición: Servicios de red innecesarios expuestos.
- Causa Raíz: Fallo al minimizar la superficie de ataque.
- Impacto: Explotación de servicios vulnerables.
- Mitigación: Auditorías de escaneo de puertos, reglas de firewall, minimización de servicios.

**CORS Mal Configurado (35)**
- Definición: Políticas de intercambio de recursos de origen cruzado excesivamente permisivas.
- Causa Raíz: Orígenes comodín (wildcards), configuración inadecuada de CORS.
- Impacto: Ataques de solicitud entre sitios, robo de datos.
- Mitigación: Lista blanca de orígenes confiables, validar encabezados CORS.

**Software No Parcheado (34)**
- Definición: Sistemas que ejecutan software vulnerable desactualizado.
- Causa Raíz: Gestión de parches descuidada.
- Impacto: Explotación de vulnerabilidades conocidas.
- Mitigación: Programa de gestión de parches, escaneo de vulnerabilidades, actualizaciones automatizadas.

### Fase 5: Vulnerabilidades Relacionadas con XML

Evaluar la seguridad del procesamiento XML:

**XXE - Inyección de Entidades Externas XML (37)**
- Definición: Explotación de parsers XML para acceder a archivos o sistemas internos.
- Causa Raíz: Procesamiento de entidades externas habilitado.
- Impacto: Divulgación de archivos, SSRF, denegación de servicio.
- Mitigación: Desactivar entidades externas, usar parsers XML seguros.

**XEE - Expansión de Entidades XML (38)**
- Definición: Expansión excesiva de entidades que causa el agotamiento de recursos.
- Causa Raíz: Expansión ilimitada de entidades permitida.
- Impacto: Denegación de servicio, caída del parser.
- Mitigación: Limitar la expansión de entidades, configurar restricciones en el parser.

**Bomba XML (Billion Laughs) (39)**
- Definición: XML diseñado con entidades anidadas que consume recursos.
- Causa Raíz: Definiciones de entidades recursivas.
- Impacto: Agotamiento de memoria, denegación de servicio.
- Mitigación: Límites de expansión de entidades, restricciones de tamaño de entrada.

**Denegación de Servicio XML (65)**
- Definición: XML especialmente diseñado que causa un procesamiento excesivo.
- Causa Raíz: Estructuras de documentos complejas sin límites.
- Impacto: Agotamiento de CPU/memoria, falta de disponibilidad del servicio.
- Mitigación: Validación de esquemas, límites de tamaño, tiempos de espera de procesamiento.

### Fase 6: Control de Acceso Roto

Evaluar la aplicación de la autorización:

**Autorización Inadecuada (40)**
- Definición: Fallo al aplicar correctamente los controles de acceso.
- Causa Raíz: Políticas de autorización débiles, falta de comprobaciones.
- Impacto: Acceso no autorizado a recursos sensibles.
- Mitigación: RBAC, IAM centralizado, revisiones periódicas de acceso.

**Escalada de Privilegios (41)**
- Definición: Obtención de acceso elevado más allá de los permisos previstos.
- Causa Raíz: Permisos mal configurados, vulnerabilidades del sistema.
- Impacto: Compromiso total del sistema, manipulación de datos.
- Mitigación: Privilegio mínimo, parcheado regular, monitoreo de privilegios.

**Navegación Forzada (43)**
- Definición: Manipulación directa de URLs para acceder a recursos restringidos.
- Causa Raíz: Controles de acceso débiles, URLs predecibles.
- Impacto: Acceso no autorizado a archivos/directorios.
- Mitigación: Controles de acceso del lado del servidor, rutas de recursos no predecibles.

**Falta de Control de Acceso a Nivel de Función (44)**
- Definición: Funciones administrativas o privilegiadas no protegidas.
- Causa Raíz: Autorización solo a nivel de interfaz de usuario.
- Impacto: Ejecución no autorizada de funciones.
- Mitigación: Autorización del lado del servidor para todas las funciones, RBAC.

### Fase 7: Deserialización Insegura

Evaluar la seguridad de la serialización de objetos:

**Ejecución Remota de Código vía Deserialización (45)**
- Definición: Ejecución de código arbitrario mediante objetos serializados maliciosos.
- Causa Raíz: Deserialización de datos no confiables sin validación.
- Impacto: Compromiso completo del sistema, ejecución de código.
- Mitigación: Evitar deserializar datos no confiables, comprobaciones de integridad, validación de tipos.

**Manipulación de Datos (46)**
- Definición: Modificación no autorizada de datos serializados.
- Causa Raíz: Falta de verificación de integridad.
- Impacto: Corrupción de datos, manipulación de privilegios.
- Mitigación: Firmas digitales, validación HMAC, cifrado.

**Inyección de Objetos (47)**
- Definición: Instanciación de objetos maliciosos durante la deserialización.
- Causa Raíz: Prácticas de deserialización inseguras.
- Impacto: Ejecución de código, acceso no autorizado.
- Mitigación: Restricciones de tipo, lista blanca de clases, librerías seguras.

### Fase 8: Evaluación de Seguridad de API

Evaluar vulnerabilidades específicas de las APIs:

**Endpoints de API Inseguros (48)**
- Definición: APIs sin controles de seguridad adecuados.
- Causa Raíz: Diseño pobre de la API, falta de autenticación.
- Impacto: Brechas de datos, acceso no autorizado.
- Mitigación: OAuth/JWT, HTTPS, validación de entrada, limitación de tasa.

**Exposición de Claves de API (49)**
- Definición: Credenciales de API filtradas o expuestas.
- Causa Raíz: Claves codificadas (hardcoded), almacenamiento inseguro.
- Impacto: Acceso no autorizado a la API, abuso.
- Mitigación: Almacenamiento seguro de claves, rotación, variables de entorno.

**Falta de Limitación de Tasa (50)**
- Definición: Falta de controles sobre la frecuencia de solicitudes a la API.
- Causa Raíz: Ausencia de mecanismos de regulación (throttling).
- Impacto: DoS, abuso de la API, agotamiento de recursos.
- Mitigación: Límites de tasa por usuario/IP, throttling, protección DDoS.

**Validación de Entrada Inadecuada (51)**
- Definición: APIs que aceptan entrada de usuario no validada.
- Causa Raíz: Falta de validación en el lado del servidor.
- Impacto: Ataques de inyección, corrupción de datos.
- Mitigación: Validación estricta, consultas parametrizadas, WAF.

**Abuso de API (75)**
- Definición: Explotación de la funcionalidad de la API con fines maliciosos.
- Causa Raíz: Confianza excesiva en la entrada del cliente.
- Impacto: Robo de datos, toma de control de cuentas, abuso del servicio.
- Mitigación: Autenticación sólida, análisis de comportamiento, detección de anomalías.

### Fase 9: Seguridad de la Comunicación

Evaluar las protecciones de la capa de transporte:

**Ataque Man-in-the-Middle (52)**
- Definición: Intercepción de la comunicación entre las partes.
- Causa Raíz: Canales no cifrados, redes comprometidas.
- Impacto: Robo de datos, secuestro de sesión, suplantación de identidad.
- Mitigación: TLS/SSL, certificate pinning, autenticación mutua.

**Seguridad Insuficiente en la Capa de Transporte (53)**
- Definición: Cifrado débil o desactualizado para datos en tránsito.
- Causa Raíz: Protocolos obsoletos (SSLv2/3), cifrados débiles.
- Impacto: Intercepción de tráfico, robo de credenciales.
- Mitigación: TLS 1.2+, suites de cifrado fuertes, HSTS.

**Configuración Insegura de SSL/TLS (54)**
- Definición: Ajustes de cifrado configurados incorrectamente.
- Causa Raíz: Cifrados débiles, falta de confidencialidad directa (forward secrecy).
- Impacto: Descifrado de tráfico, ataques MITM.
- Mitigación: Suites de cifrado modernas, PFS, validación de certificados.

**Protocolos de Comunicación Inseguros (55)**
- Definición: Uso de protocolos no cifrados (HTTP, Telnet, FTP).
- Causa Raíz: Sistemas heredados (legacy), falta de conciencia sobre seguridad.
- Impacto: Sniffing de tráfico, exposición de credenciales.
- Mitigación: HTTPS, SSH, SFTP, túneles VPN.

### Fase 10: Vulnerabilidades del Lado del Cliente

Evaluar la seguridad del lado del navegador:

**XSS basado en DOM (56)**
- Definición: XSS a través de la manipulación de JavaScript en el cliente.
- Causa Raíz: Manipulación insegura del DOM con entrada de usuario.
- Impacto: Robo de sesión, recolección de credenciales.
- Mitigación: APIs DOM seguras, CSP, sanitización de entrada.

**Comunicación de Origen Cruzado Insegura (57)**
- Definición: Manejo inadecuado de solicitudes de origen cruzado.
- Causa Raíz: Políticas CORS/SOP relajadas.
- Impacto: Fuga de datos, ataques CSRF.
- Mitigación: CORS estricto, tokens CSRF, validación de origen.

**Envenenamiento de Caché del Navegador (58)**
- Definición: Manipulación del contenido en caché.
- Causa Raíz: Validación de caché débil.
- Impacto: Entrega de contenido malicioso.
- Mitigación: Encabezados Cache-Control, HTTPS, comprobaciones de integridad.

**Clickjacking (59, 71)**
- Definición: Ataque de rediseño de UI que engaña a los usuarios para que hagan clic en elementos ocultos.
- Causa Raíz: Falta de protección de marcos (frames).
- Impacto: Acciones no intencionadas, robo de credenciales.
- Mitigación: X-Frame-Options, CSP frame-ancestors, frame-busting.

**Problemas de Seguridad de HTML5 (60)**
- Definición: Vulnerabilidades en APIs de HTML5 (WebSockets, Storage, Geolocation).
- Causa Raíz: Uso inadecuado de APIs, validación insuficiente.
- Impacto: Fuga de datos, XSS, violaciones de privacidad.
- Mitigación: Uso seguro de APIs, validación de entrada, sandboxing.

### Fase 11: Evaluación de Denegación de Servicio

Evaluar las amenazas a la disponibilidad:

**DDoS - Denegación de Servicio Distribuida (61)**
- Definición: Abrumar a los sistemas con tráfico desde múltiples fuentes.
- Causa Raíz: Botnets, ataques de amplificación.
- Impacto: Falta de disponibilidad del servicio, pérdida de ingresos.
- Mitigación: Servicios de protección DDoS, limitación de tasa, CDN.

**DoS en la Capa de Aplicación (62)**
- Definición: Apuntar a la lógica de la aplicación para agotar recursos.
- Causa Raíz: Código ineficiente, operaciones intensivas en recursos.
- Impacto: Falta de disponibilidad de la aplicación, rendimiento degradado.
- Mitigación: Limitación de tasa, caché, WAF, optimización de código.

**Agotamiento de Recursos (63)**
- Definición: Agotar recursos de CPU, memoria, disco o red.
- Causa Raíz: Gestión de recursos ineficiente.
- Impacto: Caídas de sistemas, degradación del servicio.
- Mitigación: Cuotas de recursos, monitoreo, balanceo de carga.

**Ataque Slowloris (64)**
- Definición: Mantener conexiones abiertas con solicitudes HTTP parciales.
- Causa Raíz: No hay tiempos de espera de conexión.
- Impacto: Agotamiento de recursos del servidor web.
- Mitigación: Tiempos de espera de conexión, límites de solicitud, proxy inverso.

### Fase 12: Falsificación de Solicitudes del Lado del Servidor

Evaluar las vulnerabilidades SSRF:

**SSRF - Falsificación de Solicitudes del Lado del Servidor (66)**
- Definición: Manipular el servidor para que realice solicitudes a recursos internos.
- Causa Raíz: URLs controladas por el usuario no validadas.
- Impacto: Acceso a la red interna, robo de datos, acceso a metadatos de la nube.
- Mitigación: Lista blanca de URLs, segmentación de red, filtrado de salida (egress).

**SSRF Ciego (87)**
- Definición: SSRF sin visibilidad directa de la respuesta.
- Causa Raíz: Similar a SSRF, pero más difícil de detectar.
- Impacto: Filtración de datos, reconocimiento interno.
- Mitigación: Listas de permitidos (allowlists), WAF, restricciones de red.

**SSRF Ciego Basado en Tiempo (88)**
- Definición: Inferir el éxito de la SSRF a través del tiempo de respuesta.
- Causa Raíz: Retrasos en el procesamiento que indican el resultado de la solicitud.
- Impacto: Explotación prolongada, evasión de detección.
- Mitigación: Tiempos de espera de solicitud, detección de anomalías, monitoreo de tiempos.

### Fase 13: Vulnerabilidades Web Adicionales

| # | Vulnerabilidad | Causa Raíz | Impacto | Mitigación |
|---|--------------|-----------|--------|------------|
| 67 | Contaminación de Parámetros HTTP | Análisis inconsistente | Inyección, bypass de ACL | Análisis estricto, validación |
| 68 | Redirecciones Inseguras | Destinos no validados | Phishing, malware | Lista blanca de destinos |
| 69 | Inclusión de Archivos (LFI/RFI) | Rutas no validadas | Ejecución de código, divulgación | Lista blanca de archivos, desactivar RFI |
| 70 | Bypass de Encabezados de Seguridad | Encabezados mal configurados | XSS, clickjacking | Encabezados adecuados, auditorías |
| 72 | Tiempo de Espera de Sesión Inadecuado | Tiempos de espera excesivos | Secuestro de sesión | Terminación en ralentí, tiempos de espera |
| 73 | Registro Insuficiente | Falta de infraestructura | Brechas en la detección | SIEM, alertas |
| 74 | Fallos de Lógica de Negocio | Diseño inseguro | Fraude, ops no autorizadas | Modelado de amenazas, pruebas |

### Fase 14: Seguridad Móvil e IoT

| # | Vulnerabilidad | Causa Raíz | Impacto | Mitigación |
|---|--------------|-----------|--------|------------|
| 76 | Almacenamiento Móvil Inseguro | Texto plano, cripto débil | Robo de datos | Keychain/Keystore, cifrar |
| 77 | Transmisión Móvil Insegura | HTTP, fallos de cert | Intercepción de tráfico | TLS, cert pinning |
| 78 | APIs Móviles Inseguras | Falta de auth/validación | Exposición de datos | OAuth/JWT, validación |
| 79 | Ingeniería Inversa de Apps | Creds codificadas | Robo de credenciales | Ofuscación, RASP |
| 80 | Problemas de Gestión de IoT | Auth débil, sin TLS | Toma de control del dispositivo | Auth sólida, TLS |
| 81 | Autenticación de IoT Débil | Contraseñas por defecto | Acceso no autorizado | Creds únicas, MFA |
| 82 | Vulnerabilidades de IoT | Fallos de diseño, firmware viejo | Reclutamiento en botnets | Actualizaciones, segmentación |
| 83 | Acceso a Hogar Inteligente | Valores por defecto inseguros | Invasión de la privacidad | MFA, segmentación |
| 84 | Problemas de Privacidad de IoT | Recolección excesiva | Vigilancia | Minimización de datos |

### Fase 15: Amenazas Avanzadas y de Día Cero

| # | Vulnerabilidad | Causa Raíz | Impacto | Mitigación |
|---|--------------|-----------|--------|------------|
| 89 | MIME Sniffing | Falta de encabezados | XSS, spoofing | X-Content-Type-Options |
| 91 | Bypass de CSP | Configuración débil | XSS a pesar de CSP | CSP estricto, nonces |
| 92 | Validación Inconsistente | Lógica descentralizada | Bypass de control | Validación centralizada |
| 93 | Condiciones de Carrera | Falta de sincronización | Escalada de privilegios | Bloqueo (locking) adecuado |
| 94-95 | Fallos de Lógica de Negocio | Falta de validación | Fraude financiero | Validación del lado del servidor |
| 96 | Enumeración de Cuentas | Diferentes respuestas | Ataques dirigidos | Respuestas uniformes |
| 98-99 | Vulnerabilidades No Parcheadas| Retrasos en parches | Explotación de día cero | Gestión de parches |
| 100 | Exploits de Día Cero | Vulnerabilidades desconocidas | Ataques no mitigados | Defensa en profundidad |

---

## Referencia Rápida

### Resumen de Categorías de Vulnerabilidades

| Categoría | Números de Vulnerabilidad | Controles Clave |
|----------|----------------------|--------------|
| Inyección | 1-13 | Consultas parametrizadas, validación de entrada, codificación de salida |
| Autenticación | 14-23, 85-86 | MFA, gestión de sesiones, bloqueo de cuentas |
| Exposición de Datos | 24-27 | Cifrado en reposo/tránsito, controles de acceso, DLP |
| Misconfiguración | 28-36 | Valores por defecto seguros, endurecimiento (hardening), parcheado |
| XML | 37-39, 65 | Desactivar entidades externas, limitar expansión |
| Control de Acceso | 40-44 | RBAC, privilegio mínimo, comprobaciones de autorización |
| Deserialización | 45-47 | Evitar datos no confiables, validación de integridad |
| Seguridad de API | 48-51, 75 | OAuth, limitación de tasa, validación de entrada |
| Comunicación | 52-55 | TLS 1.2+, validación de certificados, HTTPS |
| Lado del Cliente | 56-60 | CSP, X-Frame-Options, DOM seguro |
| DoS | 61-65 | Limitación de tasa, protección DDoS, límites de recursos |
| SSRF | 66, 87-88 | Lista blanca de URLs, filtrado de salida |
| Móvil/IoT | 76-84 | Cifrado, autenticación, almacenamiento seguro |
| Lógica de Negocio | 74, 92-97 | Modelado de amenazas, pruebas de lógica |
| Día Cero | 98-100 | Defensa en profundidad, inteligencia de amenazas |

### Encabezados de Seguridad Críticos

```
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=()
```

### Mapeo con el Top 10 de OWASP

| OWASP 2021 | Vulnerabilidades Relacionadas |
|------------|------------------------|
| A01: Broken Access Control | 40-44, 23, 74 |
| A02: Cryptographic Failures | 24-25, 53-55 |
| A03: Injection | 1-13, 37-39 |
| A04: Insecure Design | 74, 92-97 |
| A05: Security Misconfiguration | 26-36 |
| A06: Vulnerable Components | 34, 98-100 |
| A07: Auth Failures | 14-23, 85-86 |
| A08: Data Integrity | 45-47 |
| A09: Logging Failures | 73 |
| A10: SSRF | 66, 87-88 |

---

## Restricciones y Limitaciones

- Las definiciones de vulnerabilidades representan patrones comunes; las implementaciones específicas varían.
- Las mitigaciones deben adaptarse al stack tecnológico y la arquitectura.
- Nuevas vulnerabilidades emergen continuamente; la referencia debe actualizarse.
- Algunas vulnerabilidades se solapan entre categorías (ej., IDOR aparece en múltiples contextos).
- La efectividad de las mitigaciones depende de una implementación adecuada.
- Los scanners automatizados no pueden detectar todos los tipos de vulnerabilidad (especialmente lógica de negocio).

---

## Solución de Problemas

### Desafíos Comunes en la Evaluación

| Desafío | Solución |
|-----------|----------|
| Falsos positivos en el escaneo | Verificación manual, análisis contextual |
| Fallos de lógica de negocio omitidos | Pruebas manuales, modelado de amenazas, análisis de casos de abuso |
| Análisis de tráfico cifrado | Configuración de proxy, instalación de certificados |
| WAF bloqueando pruebas | Ajuste de tasa, rotación de IP, codificación de payloads |
| Problemas de manejo de sesión | Gestión de cookies, seguimiento del estado de autenticación |
| Descubrimiento de API | Enumeración de Swagger/OpenAPI, análisis de tráfico |

### Técnicas de Verificación de Vulnerabilidades

| Tipo de Vulnerabilidad | Enfoque de Verificación |
|-------------------|----------------------|
| Inyección | Pruebas de payloads con variantes codificadas |
| XSS | Cuadros de alerta, acceso a cookies, inspección del DOM |
| CSRF | Pruebas de envío de formularios de origen cruzado |
| SSRF | Callbacks DNS/HTTP fuera de banda |
| XXE | Entidad externa con servidor controlado |
| Control de Acceso | Pruebas de privilegios horizontales/verticales |
| Autenticación | Rotación de credenciales, análisis de sesión |

---

## Referencias

- OWASP Top 10 Web Application Security Risks
- CWE/SANS Top 25 Most Dangerous Software Errors
- OWASP Testing Guide
- OWASP Application Security Verification Standard (ASVS)
- NIST Cybersecurity Framework
- Fuente: Kumar MS - Top 100 Web Vulnerabilities
