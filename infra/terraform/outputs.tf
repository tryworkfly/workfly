output "instance_ip" {
  value = google_compute_instance.workfly_instance.network_interface[0].access_config[0].nat_ip
}