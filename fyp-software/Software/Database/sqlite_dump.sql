BEGIN TRANSACTION;
CREATE TABLE alembic_version (
	version_num VARCHAR(32) NOT NULL, 
	CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);
CREATE TABLE deployment_node_statuses (
	id INTEGER NOT NULL, 
	deployment_id INTEGER NOT NULL, 
	node_id VARCHAR(32) NOT NULL, 
	progress INTEGER NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	error_message VARCHAR(512), 
	updated_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(deployment_id) REFERENCES deployments (id)
);
INSERT INTO "deployment_node_statuses" VALUES(1,1,'NODE-02',100,'success',NULL,'2026-03-14 21:54:21');
CREATE TABLE deployments (
	id INTEGER NOT NULL, 
	experiment_id INTEGER NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	started_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	completed_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(experiment_id) REFERENCES experiments (id)
);
INSERT INTO "deployments" VALUES(1,1,'completed','2026-03-14 21:54:19',NULL);
CREATE TABLE experiment_nodes (
	id INTEGER NOT NULL, 
	experiment_id INTEGER NOT NULL, 
	node_id VARCHAR(32) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(experiment_id) REFERENCES experiments (id)
);
INSERT INTO "experiment_nodes" VALUES(1,1,'NODE-02');
CREATE TABLE experiments (
	id INTEGER NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	description TEXT, 
	start_time DATETIME, 
	end_time DATETIME, 
	user_id INTEGER NOT NULL, 
	firmware_path VARCHAR(512), 
	firmware_original_name VARCHAR(255), 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
INSERT INTO "experiments" VALUES(1,'testing','kgju','2026-03-15 03:00:00.000000','2026-03-15 03:10:00.000000',2,'C:\Users\abc\Downloads\deep-blue-gleam-main\backend\uploads\firmware\b9a4adcd85a44005be043aa20d1b364b.bin','FYDP.ino.bin','2026-03-14 21:54:19');
CREATE TABLE firmware (
	id INTEGER NOT NULL, 
	version VARCHAR(50) NOT NULL, 
	filename VARCHAR(200) NOT NULL, 
	uploaded_at DATETIME, 
	PRIMARY KEY (id)
);
INSERT INTO "firmware" VALUES(1,'FYDP.ino','b9a4adcd85a44005be043aa20d1b364b.bin','2026-03-14 21:54:19.068038');
CREATE TABLE nodes (
	id INTEGER NOT NULL, 
	node_id VARCHAR(32) NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	ip_address VARCHAR(45), 
	firmware_version VARCHAR(64), 
	battery_level INTEGER, 
	last_heartbeat DATETIME, 
	last_active DATETIME, 
	current_experiment_id INTEGER, 
	temperature FLOAT, 
	humidity FLOAT, 
	light FLOAT, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	updated_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(current_experiment_id) REFERENCES experiments (id)
);
INSERT INTO "nodes" VALUES(1,'NODE-01','reserved','192.168.100.191','v2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-14 15:53:42','2026-03-14 16:13:32');
INSERT INTO "nodes" VALUES(2,'NODE-02','reserved','192.168.100.235','v0',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-14 16:04:50','2026-03-14 21:54:19');
INSERT INTO "nodes" VALUES(3,'NODE-03','idle','192.168.100.190','v0',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-14 16:12:48','2026-03-14 16:58:30');
INSERT INTO "nodes" VALUES(4,'NODE-04','idle','192.168.100.76','v0',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-14 16:13:21','2026-03-14 19:10:58');
CREATE TABLE sensor_data (
	id INTEGER NOT NULL, 
	node_id VARCHAR(32) NOT NULL, 
	temperature FLOAT, 
	humidity FLOAT, 
	light FLOAT, 
	timestamp DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id)
);
INSERT INTO "sensor_data" VALUES(1,'EC:E3:34:C0:39:A8',29.8,49.0,751.0,'2026-03-17 11:24:18');
INSERT INTO "sensor_data" VALUES(2,'EC:E3:34:C0:39:A8',29.8,49.0,221.0,'2026-03-17 11:24:58');
INSERT INTO "sensor_data" VALUES(3,'EC:E3:34:C0:39:A8',29.8,49.0,208.0,'2026-03-17 11:25:40');
INSERT INTO "sensor_data" VALUES(4,'EC:E3:34:C0:39:A8',29.8,49.0,223.0,'2026-03-17 11:26:40');
INSERT INTO "sensor_data" VALUES(5,'EC:E3:34:BF:DC:04',29.3,49.0,597.0,'2026-03-17 11:32:52');
INSERT INTO "sensor_data" VALUES(20,'08:B6:1F:B8:4B:78',30.8,53.0,89.0,'2026-03-17 12:29:53');
INSERT INTO "sensor_data" VALUES(21,'08:B6:1F:B8:4B:78',30.8,53.0,89.0,'2026-03-17 12:30:22');
INSERT INTO "sensor_data" VALUES(22,'08:B6:1F:B8:4B:78',30.8,54.0,79.0,'2026-03-17 12:30:52');
INSERT INTO "sensor_data" VALUES(23,'08:B6:1F:B8:4B:78',30.8,54.0,96.0,'2026-03-17 12:31:22');
INSERT INTO "sensor_data" VALUES(24,'08:B6:1F:B8:4B:78',30.8,54.0,97.0,'2026-03-17 12:31:52');
INSERT INTO "sensor_data" VALUES(25,'08:B6:1F:B8:4B:78',30.8,54.0,91.0,'2026-03-17 12:32:22');
INSERT INTO "sensor_data" VALUES(26,'08:B6:1F:B8:4B:78',30.8,53.0,102.0,'2026-03-17 12:32:52');
INSERT INTO "sensor_data" VALUES(27,'08:B6:1F:B8:4B:78',30.8,53.0,92.0,'2026-03-17 12:33:22');
INSERT INTO "sensor_data" VALUES(28,'08:B6:1F:B8:4B:78',30.8,53.0,89.0,'2026-03-17 12:33:52');
INSERT INTO "sensor_data" VALUES(29,'08:B6:1F:B8:4B:78',30.8,53.0,86.0,'2026-03-17 12:34:22');
INSERT INTO "sensor_data" VALUES(30,'CC:DB:A7:94:D2:48',30.2,50.0,769.0,'2026-03-17 12:56:21');
INSERT INTO "sensor_data" VALUES(31,'CC:DB:A7:94:D2:48',30.0,50.0,0.0,'2026-03-17 12:56:51');
INSERT INTO "sensor_data" VALUES(38,'CC:DB:A7:94:D2:48',30.2,49.0,0.0,'2026-03-17 13:00:21');
INSERT INTO "sensor_data" VALUES(39,'CC:DB:A7:94:D2:48',30.2,49.0,4095.0,'2026-03-17 13:00:52');
INSERT INTO "sensor_data" VALUES(40,'CC:DB:A7:94:D2:48',30.2,49.0,0.0,'2026-03-17 13:01:22');
INSERT INTO "sensor_data" VALUES(41,'08:B6:1F:B8:4B:78',30.2,51.0,560.0,'2026-03-17 13:02:11');
INSERT INTO "sensor_data" VALUES(42,'08:B6:1F:B8:4B:78',30.8,51.0,278.0,'2026-03-17 13:02:41');
INSERT INTO "sensor_data" VALUES(43,'08:B6:1F:B8:4B:78',30.8,51.0,9.0,'2026-03-17 13:03:11');
INSERT INTO "sensor_data" VALUES(44,'08:B6:1F:B8:4B:78',30.8,51.0,9.0,'2026-03-17 13:03:42');
CREATE TABLE system_logs (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	action VARCHAR(64) NOT NULL, 
	details TEXT, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
INSERT INTO "system_logs" VALUES(1,1,'login','Success','2026-02-28 23:11:01');
INSERT INTO "system_logs" VALUES(2,1,'login','Success','2026-02-28 23:16:49');
INSERT INTO "system_logs" VALUES(3,1,'login','Success','2026-02-28 23:17:29');
INSERT INTO "system_logs" VALUES(4,1,'login','Success','2026-02-28 23:18:13');
INSERT INTO "system_logs" VALUES(5,1,'login','Success','2026-02-28 23:18:36');
INSERT INTO "system_logs" VALUES(6,1,'login','Success','2026-03-01 10:39:55');
INSERT INTO "system_logs" VALUES(7,1,'experiment_created','Test Experiment','2026-03-01 10:53:13');
INSERT INTO "system_logs" VALUES(8,1,'deploy_start','Experiment Test Experiment','2026-03-01 11:57:27');
INSERT INTO "system_logs" VALUES(9,NULL,'register','Researcher signup, pending approval','2026-03-01 12:16:04');
INSERT INTO "system_logs" VALUES(10,1,'login','Success','2026-03-01 12:16:44');
INSERT INTO "system_logs" VALUES(11,3,'login','Success','2026-03-01 12:17:57');
INSERT INTO "system_logs" VALUES(12,3,'experiment_created','climate change','2026-03-01 12:49:41');
INSERT INTO "system_logs" VALUES(13,3,'deploy_start','Experiment climate change','2026-03-01 12:49:41');
INSERT INTO "system_logs" VALUES(14,1,'login','Success','2026-03-01 12:56:53');
INSERT INTO "system_logs" VALUES(15,NULL,'register','Researcher signup, pending approval','2026-03-01 18:38:57');
INSERT INTO "system_logs" VALUES(16,1,'login','Success','2026-03-01 18:39:46');
INSERT INTO "system_logs" VALUES(17,4,'login','Success','2026-03-01 18:44:46');
INSERT INTO "system_logs" VALUES(18,4,'experiment_created','light intensity','2026-03-01 18:46:44');
INSERT INTO "system_logs" VALUES(19,4,'deploy_start','Experiment light intensity','2026-03-01 18:46:44');
INSERT INTO "system_logs" VALUES(20,1,'login','Success','2026-03-01 19:07:30');
INSERT INTO "system_logs" VALUES(21,4,'login','Success','2026-03-01 19:08:59');
INSERT INTO "system_logs" VALUES(22,1,'login','Success','2026-03-14 15:23:44');
INSERT INTO "system_logs" VALUES(23,1,'login','Success','2026-03-14 15:48:09');
INSERT INTO "system_logs" VALUES(24,2,'login','Success','2026-03-14 15:49:30');
INSERT INTO "system_logs" VALUES(25,1,'login','Success','2026-03-14 15:50:18');
INSERT INTO "system_logs" VALUES(26,2,'login','Success','2026-03-14 16:15:05');
INSERT INTO "system_logs" VALUES(27,1,'login','Success','2026-03-14 16:16:16');
INSERT INTO "system_logs" VALUES(28,2,'login','Success','2026-03-14 16:24:41');
INSERT INTO "system_logs" VALUES(29,2,'experiment_created','Temp mon','2026-03-14 16:28:24');
INSERT INTO "system_logs" VALUES(30,2,'deploy_start','Experiment Temp mon','2026-03-14 16:28:24');
INSERT INTO "system_logs" VALUES(31,2,'login','Success','2026-03-14 16:48:50');
INSERT INTO "system_logs" VALUES(32,1,'login','Success','2026-03-14 16:54:00');
INSERT INTO "system_logs" VALUES(33,2,'login','Success','2026-03-14 16:54:31');
INSERT INTO "system_logs" VALUES(34,1,'login','Success','2026-03-14 16:58:09');
INSERT INTO "system_logs" VALUES(35,2,'login','Success','2026-03-14 16:59:00');
INSERT INTO "system_logs" VALUES(36,2,'experiment_created','testing','2026-03-14 17:00:29');
INSERT INTO "system_logs" VALUES(37,2,'deploy_start','Experiment testing','2026-03-14 17:00:29');
INSERT INTO "system_logs" VALUES(38,2,'login','Success','2026-03-14 19:10:12');
INSERT INTO "system_logs" VALUES(39,1,'login','Success','2026-03-14 19:10:31');
INSERT INTO "system_logs" VALUES(40,2,'login','Success','2026-03-14 19:11:16');
INSERT INTO "system_logs" VALUES(41,2,'experiment_created','testing','2026-03-14 19:12:32');
INSERT INTO "system_logs" VALUES(42,2,'deploy_start','Experiment testing','2026-03-14 19:12:32');
INSERT INTO "system_logs" VALUES(43,2,'login','Success','2026-03-14 20:14:34');
INSERT INTO "system_logs" VALUES(44,2,'experiment_created','testing','2026-03-14 20:15:22');
INSERT INTO "system_logs" VALUES(45,2,'deploy_start','Experiment testing','2026-03-14 20:15:22');
INSERT INTO "system_logs" VALUES(46,1,'login','Success','2026-03-14 20:19:31');
INSERT INTO "system_logs" VALUES(47,2,'login','Success','2026-03-14 20:20:51');
INSERT INTO "system_logs" VALUES(48,1,'login','Success','2026-03-14 20:21:45');
INSERT INTO "system_logs" VALUES(49,2,'login','Success','2026-03-14 20:37:41');
INSERT INTO "system_logs" VALUES(50,2,'login','Success','2026-03-14 20:57:31');
INSERT INTO "system_logs" VALUES(51,2,'experiment_created','testing','2026-03-14 20:59:21');
INSERT INTO "system_logs" VALUES(52,2,'deploy_start','Experiment testing','2026-03-14 20:59:21');
INSERT INTO "system_logs" VALUES(53,1,'login','Success','2026-03-14 21:27:49');
INSERT INTO "system_logs" VALUES(54,2,'login','Success','2026-03-14 21:40:34');
INSERT INTO "system_logs" VALUES(55,2,'experiment_created','testing','2026-03-14 21:54:19');
INSERT INTO "system_logs" VALUES(56,2,'deploy_start','Experiment testing','2026-03-14 21:54:19');
CREATE TABLE users (
	id INTEGER NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	password_hash VARCHAR(255) NOT NULL, 
	full_name VARCHAR(255) NOT NULL, 
	role VARCHAR(20) NOT NULL, 
	institution VARCHAR(255), 
	research_purpose TEXT, 
	approved BOOLEAN NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id)
);
INSERT INTO "users" VALUES(1,'admin@iot.dev','$2b$12$nCYql.gzOPZiOyh8tUvnz./B.N0V3LXYPlhVE6C6pVgn4DlEUYOsK','Admin User','admin','IoT Lab',NULL,1,'2026-02-28 23:10:42');
INSERT INTO "users" VALUES(2,'researcher@iot.dev','$2b$12$fftF2trar.Y6zNxXWuv9D.sK6EUtw6zjTDe/l0Atyr28x0CXdEPei','Dr. Sarah Chen','researcher','MIT','IoT experimentation',1,'2026-02-28 23:10:42');
INSERT INTO "users" VALUES(3,'fizafarzand@gmail.com','$2b$12$/Th87CrzGCf.WG/rhrp5XugHe3E5MIm/lBGWK2gwRjO0hUShw1UWO','fiza farzand','researcher','ned','temperature',1,'2026-03-01 12:16:04');
INSERT INTO "users" VALUES(4,'hussain@gmail.com','$2b$12$L6wDPM52U..d5/IR9bGfLuBaAMWi8J3NLOxhR0dENhM2zoDzl47W6','Hussain','researcher','NED','liight intensity',1,'2026-03-01 18:38:57');
CREATE UNIQUE INDEX ix_users_email ON users (email);
CREATE INDEX ix_sensor_data_node_id ON sensor_data (node_id);
CREATE INDEX ix_sensor_data_node_timestamp ON sensor_data (node_id, timestamp);
CREATE UNIQUE INDEX ix_nodes_node_id ON nodes (node_id);
COMMIT;
