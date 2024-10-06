provider "google" {
  project     = "workfly-437804"
  region      = "us-west1"
  credentials = file("gcloud-credentials.json")
}

# Create a VPC network
resource "google_compute_network" "vpc_network" {
  name                    = "workfly-network"
  auto_create_subnetworks = "true"
}

# Create a firewall rule to allow HTTP, HTTPS and SSH traffic + backend
resource "google_compute_firewall" "allow_http_https_ssh" {
  name    = "allow-http-https-ssh"
  network = google_compute_network.vpc_network.id

  allow {
    protocol = "tcp"
    ports    = ["22", "80", "443", "8000"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["allow-http-https-ssh"]
}

# Create a compute instance
resource "google_compute_instance" "workfly_instance" {
  name         = "workfly-instance"
  machine_type = "e2-micro"
  zone         = "us-west1-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
    }
  }

  network_interface {
    network = google_compute_network.vpc_network.name
    access_config {
      // Ephemeral public IP
    }
  }

  metadata = {
    ssh-keys = "ansible:${file("~/.ssh/instance_workfly_ed25519.pub")}"
  }

  tags = ["allow-http-https-ssh"]
}
