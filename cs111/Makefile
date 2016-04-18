lab0: lab0.c
	gcc -o lab0 lab0.c
check:
	echo "12345" > input.txt
	./lab0 --input=input.txt --output=output.txt 
	diff input.txt output.txt
	./lab0 --segfault --catch || ([ $$? -eq 3 ] && echo "Return code for catch OK")
	./lab0 --input=nonexistantfile.txt || ([ $$? -eq 1 ] && echo "correctly handling of nonexistent input file OK")
	./lab0 --input=somefile.txt

clean:
	rm lab0 *.txt
dist: 
	tar -cvzf ../lab0-604589856.tar.gz ../lab0-604589856/
