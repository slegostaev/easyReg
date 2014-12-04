name := "easyReg"

version := "1.0-SNAPSHOT"

libraryDependencies ++= Seq(
  javaJdbc,
  javaEbean,
  cache
)

lazy val root = (project in file(".")).enablePlugins(PlayJava)