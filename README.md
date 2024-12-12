# Cloud Gaming Resource Allocation: Pixel Streaming and Kubernetes

This repository showcases two cloud gaming infrastructure setups:
-   Unreal Engine Pixel Streaming Demo using a GPU-enabled VM.
-   Minecraft Server Deployment on Kubernetes with dynamic scaling and monitoring.

These setups highlight resource allocation strategies and scalability in cloud gaming environments.

## Unreal Engine Pixel Streaming

Stream high-quality Unreal Engine gameplay from a GPU-enabled VM to client devices via WebRTC.
##### Steps:

1.  **Provision a GPU-enabled VM:**
    
    -   Use Windows Server 2022.
    -   Select an NVIDIA GPU (e.g., NVIDIA L4).
    -   Install the required GPU drivers.
2.  **Install Unreal Engine:**
    
    -   Download and install Unreal Engine from Epic Games Launcher.
    You can choose a suitable demo from the Fab marketplace. This project uses the [Pixel Streaming Demo](https://www.fab.com/listings/bfa184d1-f336-4613-933a-a906f98d9c16).
    -   Open your project in Unreal Engine.
3.  **Enable Pixel Streaming:**
    
    -   Configure Pixel Streaming settings in Unreal Engine using [this](https://dev.epicgames.com/documentation/en-us/unreal-engine/pixel-streaming-sample-project-for-unreal-engine) guide.
    -   Create a copy of the executable file (PixelStreamingDemo.exe) and use these launch parameters: `"PixelStreamingDemo.exe" -PixelStreamingURL=ws://127.0.0.1:8888 -RenderOffScreen`. RenderOffScreen ensures that the game runs in the background.
        
4.  **Deploy the Signaling Server:**
    
    -   Clone the signaling server from [Epic Games GitHub](https://github.com/EpicGamesExt/PixelStreamingInfrastructure/).
    - Since we are using a Windows 2022 Server, we can use the cmd scripts given in the repo. Go to SignallingWebServer/platform_scripts/cmd and run `start_with_turn.bat`.
    -   Port forward 8888/8889 and 80 for external access.
    - Wait for the server to fully start up.
5.  **Test Streaming:**
    
    -   Open a browser and navigate to the public IP of the VM to access the game stream.
    - In this case, go to `<IP_ADDRESS>/showcase.html` to run the demo provided by the Unreal Engine team.

## Minecraft Server on a VM

### Bot Simulation
Simulate player activity by deploying bots to the Minecraft server.
##### Steps:

1.  **Setup the Bot Environment:**
    
    -   Use the provided `bot.js` script to create bots that connect to the Minecraft server.
    -   Install dependencies using the `package.json` file. Run `npm install` to setup the required packages.
        
2.  **Build and Deploy the Bot Container:**
    
    -   Use the `Dockerfile` to containerize the bot setup.
    -   Build the container:

        ```bash
        docker build -t minecraft-bot .
        ```
    - Push the docker container to docker hub. The container used in this project can be found [here](https://hub.docker.com/r/tirththoria/minecraft-bot).    
    -   Run the container using Docker Compose:

        ```bash
        docker-compose up -d
        ``` 
        
3.  **Scaling Bots:**
    
    -   Use the `scale-bots.sh` script to increase the number of bots connecting to the server:

        ```bash
        ./scale-bots.sh <number_of_bots>
        ``` 
    -   Remove bots using the `remove-bots.sh` script:

        ```bash
        ./remove-bots.sh
        ```

4.  **Test and Monitor:**
    
    -   Observe how the Minecraft server handles increased load from bots.
    -   Monitor server resource usage through Prometheus and Grafana.

### Minecraft Server on VM
Run a Minecraft server using the `itzg/minecraft-server` Docker image.
##### Steps:

1.  **Provision a Linux VM:**
    
    -   Use Ubuntu 20.04 or a similar distribution.
    -   Ensure at least 2 CPUs and 4GB of RAM.
2.  **Install Docker:**

    ```bash
    sudo apt install docker.io -y
    ```

3. **Pull the minecraft server container**
   
    ```bash
    docker pull itzg/minecraft-server
    ```

5.  **Run the Minecraft Server Container:**
    ```bash
    docker run -d --name minecraft-server \
        -p 25565:25565 \
        -e EULA=TRUE \
        -e ONLINE_MODE=FALSE \
        -e MAX_PLAYERS=100 \
        -e GAMEMODE=creative \
        itzg/minecraft-server
    ```

6.  **Test the Server:**
    
    -   Connect to the server using its public IP on port `25565`.

### Installing Prometheus, Grafana, Node Exporter, and cAdvisor on the VM

Monitor the Minecraft server running on a VM.
##### Steps:

1.  **Run Prometheus:**
    
    -   Create a `prometheus.yml` configuration file:
        
        ```yml
        global:
          scrape_interval: 15s
        scrape_configs:
          - job_name: 'node_exporter'
            static_configs:
              - targets: ['localhost:9100']
          - job_name: 'cadvisor'
            static_configs:
              - targets: ['localhost:8080']` 
        
    -   Start Prometheus:
        
        ```bash
        docker run -d --name prometheus -p 9090:9090 -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus
        ``` 
        
2.  **Run Node Exporter:**

    
    ```bash
    docker run -d --name node_exporter -p 9100:9100 prom/node-exporter
    ```

3.  **Run cAdvisor:**
    
    ```bash
    docker run \
        --volume=/:/rootfs:ro \
        --volume=/var/run:/var/run:ro \
        --volume=/sys:/sys:ro \
        --volume=/var/lib/docker/:/var/lib/docker:ro \
        --publish=9323:9323 \
        --detach=true \
        --name=cadvisor \
        gcr.io/cadvisor/cadvisor:v0.47.0
    ``` 
    
4.  **Run Grafana:**
    
    ```bash
    docker run -d -p 3000:3000 --name=grafana grafana/grafana
    ```
    
    -   Access Grafana at `http://<VM-IP>:3000` and configure Prometheus as a data source.
5.  **Visualize Metrics:**
    
    -   Import Grafana dashboards to visualize Minecraft server CPU, memory, and network usage.
    
    Configure Grafana to Use Prometheus as a Data Source:

6. **Access Grafana:**
    -   Open your browser and navigate to `http://[MINECRAFT_SERVER_EXTERNAL_IP]:3000`.
    -   Add Prometheus Data Source:
    -   Log in to Grafana.
    -   Go to Configuration > Data Sources > Add data source.
    -   Select Prometheus.
    -   Set the URL to `http://[MINECRAFT_SERVER_EXTERNAL_IP]:9090`.
    -   Click Save & Test to verify the connection.
    -   Import Pre-built Dashboards or Create Custom Dashboards:

7. **Import a Node Exporter Dashboard:**

    -   Go to Create > Import.
    -   Enter Dashboard ID (e.g., 1860 for Node Exporter Full).
    -   Click Load, select Prometheus as the data source, and import.

### Minecraft Server on Kubernetes
Deploy a scalable Minecraft server using Kubernetes.

#### Steps:
1.  **Provision a Kubernetes Cluster:**
    -   Use a cloud provider (e.g., GKE, EKS).
    -   Create a cluster with at least 3 nodes.

2.  **Deploy Minecraft Server:**
    -   Use the `itzg/minecraft-server` Helm chart.
    -   Create a `values.yml` file with the desired configuration.

    ```bash
    helm repo add itzg https://itzg.github.io/minecraft-server-charts/
    helm install -f values.yml minecraft itzg/minecraft
    ```

3.  **Scale the Server:**

    ```bash
    kubectl autoscale deployment minecraft --cpu-percent=50 --min=1 --max=10
    ```

----------

## Dependencies

-   Unreal Engine 5+
-   Kubernetes Cluster
-   Prometheus and Grafana
-   Helm 3+
-   Node.js (for Minecraft bots)
-   Docker and Docker Compose

----------

## Key Notes

-   **Persistence:** Ensure PersistentVolumeClaims (PVCs) are used to retain Minecraft world data.
-   **Scaling:** Monitor scaling events using Prometheus and visualize in Grafana.
-   **Network Configuration:** Use appropriate port forwarding to expose services.
