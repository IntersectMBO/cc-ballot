VERSION 0.8

IMPORT --allow-privileged github.com/cardano-foundation/cf-gha-workflows/./earthfiles/functions:main AS functions

ARG --global DOCKER_IMAGES_TARGETS="candidate-app voting-app vote-commitment-app voting-ledger-follower-app voting-verification-app user-verification-service voting-admin-app keri-ballot-verifier ui-summit-2024"

ARG --global DOCKER_IMAGES_PREFIX="cf"
ARG --global DOCKER_IMAGES_EXTRA_TAGS=""
ARG --global DOCKER_REGISTRIES=""
ARG --global RELEASE_TAG=""
ARG --global PUSH=false

all:
  LOCALLY
  FOR image_target IN $DOCKER_IMAGES_TARGETS
    BUILD +$image_target --PUSH=$PUSH
  END

docker-publish:
  BUILD +all --PUSH=$PUSH

TEMPLATED_RELEASE_PREPARATION:
  FUNCTION
  ARG TARGET_NAME
  ARG DOCKER_IMAGE_NAME
  ARG RELEASE_TAG
  FROM ${DOCKER_IMAGE_NAME}
  RUN mv /app/*jar /app/${TARGET_NAME}_${RELEASE_TAG}.jar
  RUN md5sum /app/*jar > /app/${TARGET_NAME}-${RELEASE_TAG}.jar.md5sum
  SAVE ARTIFACT /app/* AS LOCAL release/

candidate-app:
  ARG EARTHLY_TARGET_NAME
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGES_PREFIX}-${EARTHLY_TARGET_NAME}

  WAIT
    FROM DOCKERFILE ./backend-services/${EARTHLY_TARGET_NAME}
  END
  WAIT
    SAVE IMAGE ${DOCKER_IMAGE_NAME}
  END
  DO functions+DOCKER_TAG_N_PUSH \
     --PUSH=$PUSH \
     --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
     --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS}"

voting-app:
  ARG EARTHLY_TARGET_NAME
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGES_PREFIX}-${EARTHLY_TARGET_NAME}

  WAIT
    FROM DOCKERFILE ./backend-services/${EARTHLY_TARGET_NAME}
  END
  WAIT
    SAVE IMAGE ${DOCKER_IMAGE_NAME}
  END
  DO functions+DOCKER_TAG_N_PUSH \
     --PUSH=$PUSH \
     --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
     --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS}"

  # FIXME: not working as there is some scoping issue with earthly, see:
  # https://github.com/earthly/earthly/issues/4045
  #IF [ ! -z "${RELEASE_TAG}" ]
  #  DO +TEMPLATED_RELEASE_PREPARATION \
  #     --TARGET_NAME=${EARTHLY_TARGET_NAME} \
  #     --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
  #     --RELEASE_TAG=${RELEASE_TAG}
  #END

vote-commitment-app:
  ARG EARTHLY_TARGET_NAME
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGES_PREFIX}-${EARTHLY_TARGET_NAME}

  WAIT
    FROM DOCKERFILE ./backend-services/${EARTHLY_TARGET_NAME}
  END
  WAIT
    SAVE IMAGE ${DOCKER_IMAGE_NAME}
  END
  DO functions+DOCKER_TAG_N_PUSH \
     --PUSH=$PUSH \
     --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
     --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS}"

voting-ledger-follower-app:
  ARG EARTHLY_TARGET_NAME
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGES_PREFIX}-${EARTHLY_TARGET_NAME}

  WAIT
    FROM DOCKERFILE ./backend-services/${EARTHLY_TARGET_NAME}
  END
  WAIT
    SAVE IMAGE ${DOCKER_IMAGE_NAME}
  END
  DO functions+DOCKER_TAG_N_PUSH \
     --PUSH=$PUSH \
     --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
     --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS}"

voting-verification-app:
  ARG EARTHLY_TARGET_NAME
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGES_PREFIX}-${EARTHLY_TARGET_NAME}

  WAIT
    FROM DOCKERFILE ./backend-services/${EARTHLY_TARGET_NAME}
  END
  WAIT
    SAVE IMAGE ${DOCKER_IMAGE_NAME}
  END
  DO functions+DOCKER_TAG_N_PUSH \
     --PUSH=$PUSH \
     --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
     --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS}"

user-verification-service:
  ARG EARTHLY_TARGET_NAME
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGES_PREFIX}-${EARTHLY_TARGET_NAME}

  WAIT
    FROM DOCKERFILE ./backend-services/${EARTHLY_TARGET_NAME}
  END
  WAIT
    SAVE IMAGE ${DOCKER_IMAGE_NAME}
  END
  DO functions+DOCKER_TAG_N_PUSH \
     --PUSH=$PUSH \
     --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
     --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS}"

ui-summit-2024:
  ARG EARTHLY_TARGET_NAME
  ARG VITE_VERSION=0.1.0
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGES_PREFIX}-${EARTHLY_TARGET_NAME}

  WAIT
    FROM DOCKERFILE --build-arg VITE_VERSION=${VITE_VERSION} ./ui/summit-2024 
  END
  WAIT
    SAVE IMAGE ${DOCKER_IMAGE_NAME}
  END
  DO functions+DOCKER_TAG_N_PUSH \
     --PUSH=$PUSH \
     --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
     --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS}"

voting-admin-app:
  ARG EARTHLY_TARGET_NAME
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGES_PREFIX}-${EARTHLY_TARGET_NAME}

  WAIT
    FROM DOCKERFILE ./backend-services/${EARTHLY_TARGET_NAME}
  END
  WAIT
    SAVE IMAGE ${DOCKER_IMAGE_NAME}
  END
  DO functions+DOCKER_TAG_N_PUSH \
     --PUSH=$PUSH \
     --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
     --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS}"

keri-ballot-verifier:
  ARG EARTHLY_TARGET_NAME
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGES_PREFIX}-${EARTHLY_TARGET_NAME}

  WAIT
    FROM DOCKERFILE ./backend-services/${EARTHLY_TARGET_NAME}
  END
  WAIT
    SAVE IMAGE ${DOCKER_IMAGE_NAME}
  END
  DO functions+DOCKER_TAG_N_PUSH \
     --PUSH=$PUSH \
     --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
     --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS}"
