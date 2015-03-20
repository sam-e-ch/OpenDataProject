SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';
CREATE SCHEMA IF NOT EXISTS `openDataProject` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
CREATE DATABASE IF NOT EXISTS `openDataProject`;
USE `openDataProject` ;
CREATE TABLE IF NOT EXISTS `openDataProject`.`municipalities` (
  `municipalities_ID` INT UNSIGNED NOT NULL,
  `name` VARCHAR(45) NULL,
  `canton` VARCHAR(45) NULL,
  `max_x` FLOAT UNSIGNED NULL,
  `min_x` FLOAT UNSIGNED NULL,
  `max_y` FLOAT UNSIGNED NULL,
  `min_y` FLOAT UNSIGNED NULL,
  PRIMARY KEY (`municipalities_ID`),
  UNIQUE INDEX `municipalities_ID_UNIQUE` (`municipalities_ID` ASC))
ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS `openDataProject`.`trainstations` (
  `trainstations_ID` INT NOT NULL,
  `x_koordinate` FLOAT NOT NULL,
  `y_koordinate` FLOAT NOT NULL,
  `municipality` INT NULL,
  PRIMARY KEY (`trainstations_ID`),
  UNIQUE INDEX `idtrainStations_UNIQUE` (`trainstations_ID` ASC),
  INDEX `fk_trainstations_municipalities1_idx` (`municipality` ASC),
  CONSTRAINT `fk_trainstations_municipalities1`
    FOREIGN KEY (`municipality`)
    REFERENCES `openDataProject`.`municipalities` (`municipalities_ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS `openDataProject`.`departures` (
  `departures_ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `departure` INT NOT NULL,
  `trainstation` INT NOT NULL,
  PRIMARY KEY (`departures_ID`),
  UNIQUE INDEX `iddepartures_UNIQUE` (`departures_ID` ASC),
  INDEX `fk_departures_trainStations_idx` (`trainstation` ASC),
  CONSTRAINT `fk_departures_trainStations`
    FOREIGN KEY (`trainstation`)
    REFERENCES `openDataProject`.`trainstations` (`trainstations_ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;