name := "easyReg"

version := "1.0"

lazy val root = (project in file(".")).enablePlugins(PlayJava)

libraryDependencies ++= Seq(
  javaJdbc,
  javaEbean,
  cache,
  javaWs,
  // example version, use the "which version..." tool to determine the correct one
  "be.objectify" %% "deadbolt-java" % "2.3.1" withSources
)



resolvers += Resolver.url("Objectify Play Repository", url("http://deadbolt.ws/releases/"))(Resolver.ivyStylePatterns)