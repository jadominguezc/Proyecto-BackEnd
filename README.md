# Proyecto Backend Final

### Imagen de Docker

La imagen de Docker de este proyecto está disponible en [DockerHub](https://hub.docker.com/r/jhonmerdc/backend-final).

Para ejecutar la imagen:

```bash
docker run -p 8080:8080 jhonmerdc/backend-final:1.0

***Al usar esta se tiene acceso a la variable de entorno .env
docker run --env-file .env -p 8080:8080 jhonmerdc/backend-final:1.0
