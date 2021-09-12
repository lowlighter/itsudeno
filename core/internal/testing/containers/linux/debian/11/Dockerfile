FROM debian:bullseye-slim

RUN apt-get update \
  && apt-get install -y openssh-server sudo openssl \
  # Setup user
  && useradd it -m -G sudo -p $(openssl passwd -1 itsudeno) \
  # Configure ssh
  && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
  && mkdir -p /run/sshd \
  && ssh-keygen -A \
  && sshd -t \
  # Setup deno
  && apt-get install -y curl unzip \
  && (curl -fsSL https://deno.land/x/install/install.sh | sh) \
  && cp /root/.deno/bin/deno /usr/bin/deno \
  && apt-get remove -y curl unzip \
  # Cleaning
  && apt-get autoremove -y

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]