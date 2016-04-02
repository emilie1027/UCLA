lab0: lab0.c
	gcc -o lab0 lab0.c
check:
	file1=$(<input.txt)
	file2=$(<output.txt)
	
	lab0
	lab0 --input
	lab0 --output
	lab0 --input --output --segfault 
	lab0 --input --output --segfault --catch 
clean:
	rm lab0 
dist:
