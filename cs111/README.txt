1.included files: lab0.c 	C source module that implement the basic function
		  Makefile 	build the program and tarball 
		  gdb-1		screenshot for showing a segfault and associated stack-trace
		  gdb-2		screenshot for showing breakpoint and variable inspection
		  README.txt 	description for the project

2.smoke-test description
(1)create an input file with filename and use it to copy to output file with filename. The test case will pass when input has the same content as output and return code is 0.
(2)when setting segfault and catch, a segmentation fault is raised and caught. So the return is 3 and an error message is logged on stderr
(3)give a nonexistent input file name, the module will return code 1 and print error message to stderr.
(4)invalid argument check. If there is no input for argument --input, then the module should print error message, exit and return code 4 (self-defined).  